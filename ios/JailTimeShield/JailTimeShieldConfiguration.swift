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

        // Title: "SENTENCED"
        let title = ShieldConfiguration.Label(
            text: "⚖️  SENTENCED",
            color: UIColor(red: 1.0, green: 0.784, blue: 0.239, alpha: 1.0) // gold #FFC83D
        )

        // Body: explain why it's blocked
        let subtitle = ShieldConfiguration.Label(
            text: "\(appName) has been taken into custody.\nYou've used your daily allowance. Serve your sentence before re-entering.",
            color: UIColor(red: 0.965, green: 0.878, blue: 0.722, alpha: 1.0) // cream #F6E0B8
        )

        // Primary button: none (user cannot bypass by default)
        // If emergency bypass is set, we show it — JS handles the actual bypass logic
        // by calling clearImmediateBlock, so here the button just closes the shield UI.
        let primaryButton = ShieldConfiguration.Label(
            text: "🔒  Locked",
            color: UIColor(red: 0.843, green: 0.208, blue: 0.165, alpha: 1.0) // danger red
        )

        return ShieldConfiguration(
            backgroundBlurStyle: .dark,
            backgroundColor: UIColor(red: 0.094, green: 0.043, blue: 0.031, alpha: 0.97), // #180B08
            icon: UIImage(systemName: "lock.fill")?
                .withTintColor(
                    UIColor(red: 1.0, green: 0.784, blue: 0.239, alpha: 1),
                    renderingMode: .alwaysOriginal
                ),
            title: title,
            subtitle: subtitle,
            primaryButtonLabel: primaryButton,
            primaryButtonBackgroundColor: UIColor(red: 0.478, green: 0.247, blue: 0.094, alpha: 1) // wood #7A3F18
        )
    }
}
