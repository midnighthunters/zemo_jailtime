// JailTimeShieldConfiguration.swift  (ShieldConfiguration extension target: JailTimeShield)
//
// Apple calls into this extension whenever ManagedSettings shields an app.
// We return a ShieldConfiguration that replaces the app icon with our
// jail-themed blocking screen.
//
// The UI is defined entirely by ShieldConfiguration properties — no SwiftUI
// allowed here because it runs in a separate extension process.

import ManagedSettings
import ManagedSettingsUI
import UIKit
import Foundation

class JailTimeShieldConfiguration: ShieldConfigurationDataSource {

    override func configuration(
        shielding application: Application
    ) -> ShieldConfiguration {
        return makeShield(appName: application.localizedDisplayName ?? "This App")
    }

    override func configuration(
        shielding application: Application,
        in category: ActivityCategory
    ) -> ShieldConfiguration {
        return makeShield(appName: application.localizedDisplayName ?? "This App")
    }

    override func configuration(
        shielding webDomain: WebDomain
    ) -> ShieldConfiguration {
        return makeShield(appName: webDomain.domain ?? "This Site")
    }

    // ── Shared builder ────────────────────────────────────────────────────────

    private func makeShield(appName: String) -> ShieldConfiguration {
        let policy = AppGroupStorage.loadPolicy()

        let title = ShieldConfiguration.Label(
            text: "SENTENCED",
            color: UIColor(red: 0.153, green: 0.169, blue: 0.188, alpha: 1.0) // charcoal #272B30
        )

        // Body: explain why it's blocked
        let subtitle = ShieldConfiguration.Label(
            text: "\(appName) has been taken into custody.\nYou've used your daily allowance. Serve your sentence before re-entering.",
            color: UIColor(red: 0.435, green: 0.463, blue: 0.502, alpha: 1.0) // secondary #6F7680
        )

        // Primary button: none (user cannot bypass by default)
        // If emergency bypass is set, we show it — JS handles the actual bypass logic
        // by calling clearImmediateBlock, so here the button just closes the shield UI.
        let primaryButton = ShieldConfiguration.Label(
            text: "Locked",
            color: .white
        )

        return ShieldConfiguration(
            backgroundBlurStyle: nil,
            backgroundColor: UIColor(red: 0.969, green: 0.973, blue: 0.980, alpha: 1.0), // canvas #F7F8FA
            icon: UIImage(systemName: "lock.fill")?
                .withTintColor(
                    UIColor(red: 0.886, green: 0.333, blue: 0.333, alpha: 1), // red #E25555
                    renderingMode: .alwaysOriginal
                ),
            title: title,
            subtitle: subtitle,
            primaryButtonLabel: primaryButton,
            primaryButtonBackgroundColor: UIColor(red: 0.208, green: 0.416, blue: 0.902, alpha: 1) // blue #356AE6
        )
    }
}
