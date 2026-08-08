# Screen Inventory

Audited 2026-08-07 from the Expo Router file tree and route implementations.

## Count

There are **37 route-backed screens**. This count excludes `_layout.tsx` files because they configure navigation rather than render a standalone screen.

| Group | Count | Notes |
| --- | ---: | --- |
| Entry and blocked-app routes | 2 | `/` is a hydration/redirect gate; `[appId]` is the block screen |
| Report route | 1 | Dedicated evidence, offender, parole, and rewards report |
| Onboarding | 16 | Ordered by `src/data/onboarding.ts` |
| Tab routes | 6 | 3 visible tabs and 3 hidden deep-link routes |
| Modal routes | 12 | Presented as stack modals |
| **Total** | **37** | |

## Report route

| Route | What it does |
| --- | --- |
| `/report` | Dedicated report opened from Jail's top-right Report button; contains Owl Justice, worst offender, trial evidence, parole, rewards, and history. |

## Entry and enforcement routes

| Route | Purpose |
| --- | --- |
| `/` | Waits for the persisted Zustand store to hydrate, then redirects new users to `/onboarding` or returning users to `/(tabs)/courtroom`. |
| `/blocked/[appId]` | Explains that a selected app is blocked, identifies the suspect app, and offers a breathing-based unblock flow or a return to Jail. |

## Onboarding screens (16)

The standard `OnboardingScene` shows the briefing number, artwork, copy, and next CTA. Each step writes into `useCourtStore`; the final Parole step completes onboarding and replaces the stack with the Courtroom tab.

| # | Route | What it does |
| ---: | --- | --- |
| 1 | `/onboarding` | Opens the fictional focus court and starts the intake. |
| 2 | `/onboarding/goals` | Collects multi-select focus goals such as sleep, study, presence, and exercise. |
| 3 | `/onboarding/age` | Collects the user’s age range. |
| 4 | `/onboarding/role` | Collects the user role, such as student, technologist, parent, or creative. |
| 5 | `/onboarding/screentime-intake` | Collects the user’s estimated average daily screen-time band. |
| 6 | `/onboarding/tracking` | Requests iOS App Tracking Transparency permission, with an option to continue without it. |
| 7 | `/onboarding/profile` | Collects an optional defendant name and the user’s main reason for wanting better focus. |
| 8 | `/onboarding/permissions` | Explains the evidence model and shows a compact iOS permission checklist. |
| 9 | `/onboarding/screen-time-permission` | Requests iOS FamilyControls/Screen Time authorization and marks screen-time, shielding, and monitoring status. |
| 10 | `/onboarding/notifications-permission` | Requests notifications for limit warnings, bedtime notices, reports, and parole updates. |
| 11 | `/onboarding/dreams` | Collects the life areas screen time is taking away from, using multi-select chips. |
| 12 | `/onboarding/routine` | Sets bedtime, wake time, daily screen target, and danger window. |
| 13 | `/onboarding/suspects` | Lets the user select initial suspect apps; premium selections open the paywall. |
| 14 | `/onboarding/style` | Sets court strictness and courtroom humor; Supreme Court strictness is premium-gated. |
| 15 | `/onboarding/laws` | Lets the user enable the first focus laws; premium laws open the paywall. |
| 16 | `/onboarding/parole` | Explains the focus-to-parole loop and completes onboarding on the final CTA. |

## Tab routes (6)

The floating tab bar visibly exposes Courtroom, Culprits, and Jail. Laws, Evidence, and Parole remain registered but hidden (`href: null`) for deep links and compatibility.

| Route | Visibility | What it does |
| --- | --- | --- |
| `/(tabs)/courtroom` | Visible: Court | Shows the active case, sentence status, clean streak, coins, charges, and parole readiness; detailed evidence, offender, parole, and rewards data is now in `/report`. |
| `/(tabs)/culprits` | Visible: Culprits | Manages suspect apps, focus-law toggles, law detail/edit sheets, premium gates, and the iOS “Select Apps to Block” flow. |
| `/(tabs)/jail` | Visible: Jail | Shows custody and sentence state, blocked apps, focus timer, sentence-reducing mini actions, emergency bypass, and parole completion. |
| `/(tabs)/laws` | Hidden | Full focus-law carousel with category filters, strictness controls, Screen Time Setup, custom-law editor, weekly report, and upgrade links. |
| `/(tabs)/evidence` | Hidden | Displays evidence cards for usage, repeat openings, sleep, goals, danger hours, and delayed dreams; links to the weekly report. |
| `/(tabs)/parole` | Hidden | Displays rank, rewards, parole history, and the premium upgrade preview. |

## Modal routes (12)

| Route | What it does |
| --- | --- |
| `/modals/add-app` | Adds a catalog app or custom website to a block category; duplicate checks and premium gates are handled here. |
| `/modals/charges-filed` | Presents the active charge and violated-law carousel; accepts the sentence or spends a mercy pass. |
| `/modals/emergency-bypass` | Collects an emergency reason and spends a mercy pass to request parole. |
| `/modals/focus-timer` | Starts a 5/15/25/45-minute focus session, optionally reducing active jail time; shows running and completed states. |
| `/modals/law-editor` | Edits the premium custom law’s name, description, limit, sentence, and enabled state. |
| `/modals/parole-granted` | Celebrates parole, shows earned points, and returns to Courtroom. |
| `/modals/paywall` | Shows Supreme Court Mode benefits, purchase packages, restore purchase, and a development-only Pro toggle. |
| `/modals/screen-time-settings` | Configures monitoring, shield intensity, sentence blocking, emergency bypass, refresh, and notification settings; shows permission count. |
| `/modals/select-apps` | Requests iOS authorization, presents `FamilyActivityPicker`, and applies the selected app policy through the native bridge. |
| `/modals/sentence` | Confirms the charge punishment and starts Jail, or returns to Courtroom. |
| `/modals/unblock` | Runs the breathe/hold interaction, lets the user choose a temporary unlock duration, and records the unblock. |
| `/modals/weekly-report` | Shows a preview of weekly evidence and routes premium users toward the full-report paywall. |

## Main state flow

`/` → onboarding (first run) → Courtroom → Culprits/Laws → iOS app selection and policy → charges → Sentence/Jail → focus actions or mercy → Parole. The persisted source of truth is `useCourtStore`; premium access is managed separately by `usePremiumStore`.
