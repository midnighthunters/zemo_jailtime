// FocusCourtModule.swift
// Expo NativeModule that bridges the Apple Screen Time stack to React Native.
//
// Exposed to JS as:  NativeModules.FocusCourtModule  (via the ObjC bridge file)
//
// Methods:
//   requestAuthorization(resolve, reject)
//   getAuthorizationStatus(resolve, reject)   → "authorized" | "denied" | "notDetermined"
//   presentAppPicker(resolve, reject)          → opens FamilyActivityPicker sheet
//   hasAppSelection(resolve, reject)           → Bool
//   applyPolicy(dailyLimitMinutes, resolve, reject)
//   clearPolicy(resolve, reject)
//   applyImmediateBlock(resolve, reject)       → shield NOW (sentence active)
//   clearImmediateBlock(resolve, reject)       → remove shield (parole / bypass)
//   getDailyUsageMinutes(resolve, reject)      → Int (approximate via DeviceActivity)

import Foundation
import FamilyControls
import DeviceActivity
import ManagedSettings
import React

@objc(FocusCourtModule)
class FocusCourtModule: NSObject {

    // Shared ManagedSettingsStore accessed by name so the extensions can also use it
    private let store = ManagedSettingsStore(named: ManagedSettingsStore.Name("jailtime"))
    private let center = DeviceActivityCenter()
    private let activityName = DeviceActivityName("jailtime.dailylimit")

    // ── Authorization ─────────────────────────────────────────────────────────

    @objc func requestAuthorization(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            do {
                try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                resolve(["granted": true])
            } catch {
                resolve(["granted": false, "reason": error.localizedDescription])
            }
        }
    }

    @objc func getAuthorizationStatus(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let status: String
        switch AuthorizationCenter.shared.authorizationStatus {
        case .approved:  status = "authorized"
        case .denied:    status = "denied"
        default:         status = "notDetermined"
        }
        resolve(status)
    }

    // ── App selection (FamilyActivityPicker) ─────────────────────────────────
    // We present the system picker from a hosting UIViewController so the promise
    // resolves once the user taps Done / Cancel.

    @objc func presentAppPicker(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            guard let rootVC = UIApplication.shared.connectedScenes
                .compactMap({ $0 as? UIWindowScene })
                .first?.windows.first?.rootViewController
            else {
                reject("NO_VC", "Could not find root view controller", nil)
                return
            }

            let existing = AppGroupStorage.loadSelection()
            let pickerVC = FamilyActivityPickerViewController(
                selection: existing ?? FamilyActivitySelection(),
                onDone: { selection in
                    AppGroupStorage.saveSelection(selection)
                    resolve([
                        "selected": true,
                        "count": selection.applications.count,
                        "categories": selection.categories.count,
                        "webDomains": selection.webDomains.count
                    ])
                },
                onCancel: {
                    resolve(["selected": false, "count": 0, "categories": 0, "webDomains": 0])
                }
            )
            rootVC.present(pickerVC, animated: true)
        }
    }

    @objc func hasAppSelection(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        resolve(AppGroupStorage.hasSelection())
    }

    @objc func getSelectionCount(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let selection = AppGroupStorage.loadSelection() else {
            resolve(["applications": 0, "categories": 0, "webDomains": 0])
            return
        }
        // Only counts are exposed. Apple keeps ApplicationTokens opaque, so the
        // app process can never read the names or bundle IDs behind them.
        resolve([
            "applications": selection.applications.count,
            "categories": selection.categories.count,
            "webDomains": selection.webDomains.count
        ])
    }

    // ── Policy readback ──────────────────────────────────────────────────────
    // The DeviceActivityMonitor extension flips `blockingActive` when the daily
    // limit is reached, even while the app is closed. JS polls this to learn that
    // a real law break happened and file a case for it.

    @objc func getPolicyState(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let policy = AppGroupStorage.loadPolicy()
        resolve([
            "dailyLimitMinutes": policy.dailyLimitMinutes,
            "blockingActive": policy.blockingActive,
            "blockStartedAt": policy.blockStartedAt ?? NSNull(),
            "hasSelection": AppGroupStorage.hasSelection()
        ])
    }

    // ── Policy (schedule-based blocking via DeviceActivityMonitor) ───────────
    // Registers a DeviceActivity schedule. When the user has used the selected
    // apps for `dailyLimitMinutes` today the MonitorExtension fires and shields them.

    @objc func applyPolicy(
        _ dailyLimitMinutes: Int,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let selection = AppGroupStorage.loadSelection(), AppGroupStorage.hasSelection() else {
            reject("NO_SELECTION", "No apps selected. Present the app picker first.", nil)
            return
        }

        // Persist policy so the extension can read it
        let policy = CourtPolicy(
            dailyLimitMinutes: dailyLimitMinutes,
            blockingActive: false,
            blockStartedAt: nil
        )
        AppGroupStorage.savePolicy(policy)

        // Build a DeviceActivity schedule: midnight → midnight (resets daily)
        let midnight = DateComponents(hour: 0, minute: 0, second: 0)
        let schedule = DeviceActivitySchedule(
            intervalStart: midnight,
            intervalEnd: DateComponents(hour: 23, minute: 59, second: 59),
            repeats: true
        )

        // Event: when accumulated usage of selected apps hits the limit
        let threshold = DateComponents(minute: dailyLimitMinutes)
        let event = DeviceActivityEvent(
            applications: selection.applications,
            categories: selection.categories,
            webDomains: selection.webDomains,
            threshold: threshold
        )

        do {
            // Stop any existing monitoring first to avoid duplicate registrations
            center.stopMonitoring([activityName])
            try center.startMonitoring(activityName, during: schedule, events: [DeviceActivityEvent.Name("limit"): event])
            resolve(["success": true])
        } catch {
            reject("MONITOR_ERROR", error.localizedDescription, error)
        }
    }

    @objc func clearPolicy(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        center.stopMonitoring([activityName])
        store.clearAllSettings()
        var policy = AppGroupStorage.loadPolicy()
        policy.blockingActive = false
        policy.blockStartedAt = nil
        AppGroupStorage.savePolicy(policy)
        resolve(["success": true])
    }

    // ── Immediate shield (sentence is active) ────────────────────────────────
    // Called by JS when the court sentences the user — blocks selected apps NOW
    // regardless of usage, until clearImmediateBlock is called.

    @objc func applyImmediateBlock(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let selection = AppGroupStorage.loadSelection(), AppGroupStorage.hasSelection() else {
            // No apps selected yet — nothing to block
            resolve(["success": false, "reason": "No apps selected"])
            return
        }

        // Shield the selected apps
        store.shield.applications = selection.applications
        store.shield.applicationCategories = .specific(selection.categories)
        store.shield.webDomains = selection.webDomains

        // Persist state
        var policy = AppGroupStorage.loadPolicy()
        policy.blockingActive = true
        let formatter = ISO8601DateFormatter()
        policy.blockStartedAt = formatter.string(from: Date())
        AppGroupStorage.savePolicy(policy)

        resolve(["success": true])
    }

    @objc func clearImmediateBlock(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        store.clearAllSettings()

        var policy = AppGroupStorage.loadPolicy()
        policy.blockingActive = false
        policy.blockStartedAt = nil
        AppGroupStorage.savePolicy(policy)

        resolve(["success": true])
    }

    // ── Required by React Native ──────────────────────────────────────────────

    @objc static func requiresMainQueueSetup() -> Bool { true }
}

// ── FamilyActivityPicker UIKit wrapper ───────────────────────────────────────
// SwiftUI's FamilyActivityPicker must be embedded in a UIHostingController
// to be presented from UIKit / React Native.

import SwiftUI

private struct PickerSheet: View {
    @Binding var selection: FamilyActivitySelection
    let onDone: (FamilyActivitySelection) -> Void
    let onCancel: () -> Void
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            FamilyActivityPicker(selection: $selection)
                .navigationTitle("Choose Apps to Monitor")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel") { onCancel(); dismiss() }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Done") { onDone(selection); dismiss() }
                    }
                }
        }
    }
}

private class FamilyActivityPickerViewController: UIHostingController<PickerSheet> {
    init(
        selection: FamilyActivitySelection,
        onDone: @escaping (FamilyActivitySelection) -> Void,
        onCancel: @escaping () -> Void
    ) {
        var sel = selection
        super.init(rootView: PickerSheet(
            selection: Binding(get: { sel }, set: { sel = $0 }),
            onDone: onDone,
            onCancel: onCancel
        ))
    }

    @MainActor required dynamic init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) not supported")
    }
}
