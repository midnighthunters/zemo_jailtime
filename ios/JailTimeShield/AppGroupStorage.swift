// AppGroupStorage.swift
// Shared data layer between the main app, DeviceActivityMonitor extension,
// and ShieldConfiguration extension via the App Group container.
// All targets read/write the same JSON file at:
//   group.com.zemolabs.jailtime / jailtime_policy.json

import Foundation
import FamilyControls

let kAppGroup = "group.com.zemolabs.jailtime"
let kPolicyFile = "jailtime_policy.json"
let kSelectionFile = "jailtime_selection.json"

// ── Policy written by JS, read by the Monitor extension ──────────────────────

struct CourtPolicy: Codable {
    /// Daily limit in minutes per selected-app group (0 = no limit / unblocked)
    var dailyLimitMinutes: Int
    /// Whether blocking is currently active (sentence in progress)
    var blockingActive: Bool
    /// Timestamp (ISO-8601) of when the current block started; nil if not blocked
    var blockStartedAt: String?
}

// ── Helpers ───────────────────────────────────────────────────────────────────

enum AppGroupStorage {

    static var containerURL: URL? {
        FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: kAppGroup)
    }

    // ── Policy ────────────────────────────────────────────────────────────────

    static func savePolicy(_ policy: CourtPolicy) {
        guard let url = containerURL?.appendingPathComponent(kPolicyFile) else { return }
        guard let data = try? JSONEncoder().encode(policy) else { return }
        try? data.write(to: url, options: .atomic)
    }

    static func loadPolicy() -> CourtPolicy {
        guard
            let url = containerURL?.appendingPathComponent(kPolicyFile),
            let data = try? Data(contentsOf: url),
            let policy = try? JSONDecoder().decode(CourtPolicy.self, from: data)
        else {
            return CourtPolicy(dailyLimitMinutes: 30, blockingActive: false, blockStartedAt: nil)
        }
        return policy
    }

    // ── FamilyActivitySelection (the user's chosen apps) ─────────────────────

    static func saveSelection(_ selection: FamilyActivitySelection) {
        guard let url = containerURL?.appendingPathComponent(kSelectionFile) else { return }
        guard let data = try? JSONEncoder().encode(selection) else { return }
        try? data.write(to: url, options: .atomic)
    }

    static func loadSelection() -> FamilyActivitySelection? {
        guard
            let url = containerURL?.appendingPathComponent(kSelectionFile),
            let data = try? Data(contentsOf: url),
            let selection = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
        else { return nil }
        return selection
    }

    static func hasSelection() -> Bool {
        guard let selection = loadSelection() else { return false }
        return !selection.applications.isEmpty
            || !selection.categories.isEmpty
            || !selection.webDomains.isEmpty
    }
}
