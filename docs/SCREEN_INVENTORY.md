# Screen Inventory

Audited 2026-08-08 from the Expo Router file tree and route implementations.

## Count

There are **36 route-backed screens**. This count excludes `_layout.tsx` files because they configure navigation rather than render a standalone screen.

| Group | Count | Notes |
| --- | ---: | --- |
| Entry and blocked-app routes | 2 | `/` is a hydration/redirect gate; `[appId]` is the block screen |
| Report route | 1 | Dedicated evidence, offender, parole, and rewards report |
| Onboarding | 16 | Ordered by `src/data/onboarding.ts` |
| Tab routes | 5 | 2 visible tabs and 3 hidden deep-link routes |
| Modal routes | 12 | Presented as stack modals |
| **Total** | **36** | |

`/(tabs)/jail` was removed when Court and Jail merged into one screen. See
`docs/DAILY_DOCKET_MASTERPLAN.md`.

## Report route

| Route | What it does |
| --- | --- |
| `/report` | Dedicated report opened from the Court header's Report button; contains Owl Justice, worst offender, trial evidence, parole, rewards, and history. |

## Entry and enforcement routes

| Route | Purpose |
| --- | --- |
| `/` | Waits for the persisted Zustand store to hydrate, then redirects new users to `/onboarding` or returning users to `/(tabs)/courtroom`. |
| `/blocked/[appId]` | Native-block fallback. Names the case holding the app, shows the focus time still owed, and starts that case's focus timer or returns to Court. |

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

## Tab routes (5)

The label-only floating tab bar visibly exposes Court and Culprits. Laws, Evidence, and Parole remain registered but hidden (`href: null`) for deep links and compatibility.

| Route | Visibility | What it does |
| --- | --- | --- |
| `/(tabs)/courtroom` | Visible: Court | The single court surface. Shows today's docket newest-case-first with verdict controls (warn / jail / dismiss), the apps under watch with their lock state, focus-time progress on jailed cases, the focus-timer CTA, and emergency bypass. Detailed evidence, offender, parole, and rewards data lives in `/report`. |
| `/(tabs)/culprits` | Visible: Culprits | Master enforcement switch, suspect apps, focus-law toggles, law detail/edit sheets, premium gates, and the iOS “Select Apps to Block” flow. |
| `/(tabs)/laws` | Hidden | Full focus-law carousel with category filters, strictness controls, Screen Time Setup, custom-law editor, weekly report, and upgrade links. |
| `/(tabs)/evidence` | Hidden | Displays evidence cards for usage, repeat openings, sleep, goals, danger hours, and delayed dreams; links to the weekly report. |
| `/(tabs)/parole` | Hidden | Displays rank, rewards, parole history, and the premium upgrade preview. |

## Modal routes (12)

| Route | What it does |
| --- | --- |
| `/modals/add-app` | Adds a catalog app or custom website to a block category; duplicate checks and premium gates are handled here. |
| `/modals/charges-filed` | Presents a freshly filed case (`caseId` param) and its violated-law carousel; sends it to jail, issues a warning, or spends a mercy pass. |
| `/modals/emergency-bypass` | Collects an emergency reason and spends a mercy pass to dismiss a case. |
| `/modals/focus-timer` | Starts a focus session from 5/15/30/35/60-minute presets or a custom 1–120. With a `caseId` param it serves that case and releases its app; without one it earns parole points. Shows running and completed states. |
| `/modals/law-editor` | Edits the premium custom law’s name, description, limit, sentence, and enabled state. |
| `/modals/parole-granted` | Celebrates parole, shows earned points, and returns to Court. |
| `/modals/paywall` | Shows Supreme Court Mode benefits, purchase packages, restore purchase, and a development-only Pro toggle. |
| `/modals/screen-time-settings` | Configures monitoring, shield intensity, sentence blocking, emergency bypass, refresh, and notification settings; shows permission count. |
| `/modals/select-apps` | Requests iOS authorization, presents `FamilyActivityPicker`, and applies the selected app policy through the native bridge. |
| `/modals/sentence` | Confirms a jail verdict for one case (`caseId` param), locking only that app until its focus time is served. |
| `/modals/unblock` | Runs the breathe/hold interaction, lets the user choose a temporary unlock duration, and records the unblock. **Currently unlinked:** focus time is the only release for a jailed app, so nothing routes here. Kept registered and working for deep links and as a candidate softer path for warned cases. |
| `/modals/weekly-report` | Shows a preview of weekly evidence and routes premium users toward the full-report paywall. |

## Main state flow

`/` → onboarding (first run) → Court → Culprits/Laws → iOS app selection and policy → a law breaks → case filed as a hearing → warning, jail, or dismissal → focus timer serves a jailed case and releases the app → docket renews at midnight.

The persisted source of truth is `useCourtStore` (`version: 2`); premium access is managed separately by `usePremiumStore`. Case reads go through `src/utils/docket.ts` so no screen re-derives lock state.
