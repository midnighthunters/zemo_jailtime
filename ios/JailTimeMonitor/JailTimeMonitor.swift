// JailTimeMonitor.swift  (DeviceActivityMonitor extension target: JailTimeMonitor)
//
// Apple calls into this extension when:
//   • intervalDidStart  – new day begins (midnight) → clear the shield
//   • intervalDidEnd    – day ended (11:59 PM) → make sure shield is still up if needed
//   • eventDidReachThreshold – user has hit the daily limit → SHIELD THE APPS
//
// This code runs OUT OF PROCESS even when JailTime is closed.

import DeviceActivity
import ManagedSettings
import Foundation

class JailTimeMonitorExtension: DeviceActivityMonitor {

    private let store = ManagedSettingsStore(named: ManagedSettingsStore.Name("jailtime"))

    // ── Daily limit hit → block now ───────────────────────────────────────────
    override func eventDidReachThreshold(
        _ event: DeviceActivityEvent.Name,
        activity: DeviceActivityName
    ) {
        guard activity.rawValue == "jailtime.dailylimit" else { return }
        applyShield()

        // Update shared state so the main app knows blocking is active
        var policy = AppGroupStorage.loadPolicy()
        policy.blockingActive = true
        let formatter = ISO8601DateFormatter()
        policy.blockStartedAt = formatter.string(from: Date())
        AppGroupStorage.savePolicy(policy)
    }

    // ── New day starts → reset (unblock) ─────────────────────────────────────
    override func intervalDidStart(for activity: DeviceActivityName) {
        guard activity.rawValue == "jailtime.dailylimit" else { return }
        clearShield()

        var policy = AppGroupStorage.loadPolicy()
        policy.blockingActive = false
        policy.blockStartedAt = nil
        AppGroupStorage.savePolicy(policy)
    }

    // ── Day ended ─────────────────────────────────────────────────────────────
    override func intervalDidEnd(for activity: DeviceActivityName) {
        guard activity.rawValue == "jailtime.dailylimit" else { return }
        // Keep whatever shield state is already set
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private func applyShield() {
        guard let selection = AppGroupStorage.loadSelection(),
              AppGroupStorage.hasSelection()
        else { return }
        store.shield.applications = selection.applications
        store.shield.applicationCategories = .specific(selection.categories)
        store.shield.webDomains = selection.webDomains
    }

    private func clearShield() {
        store.clearAllSettings()
    }
}
