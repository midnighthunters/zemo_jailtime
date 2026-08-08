# Daily Docket Masterplan

Approved scope for merging the Court and Jail tabs into one screen, moving to a
per-app daily docket, and removing all functional icons.

Status: **implemented**. This document is the contract for the mechanic; the
visual contract remains `PREMIUM_WHITE_UI.md`.

## Why

Three problems drove this change.

1. **Duplicate surfaces.** `courtroom.tsx` and `jail.tsx` both read
   `activeCase.status` / `remainingSentenceSeconds` and re-derived their own
   labels and tones from it. "Am I jailed, and for how long" was answerable on
   two tabs with two different visual languages.
2. **A single global sentence.** The old model had one `activeCase` plus a flat
   `charges` array. Jail was all-or-nothing across every app, and nothing in the
   codebase ever created a charge, so the whole charge/sentence surface rendered
   fallbacks forever.
3. **No daily reset.** `resetCourtDay()` existed but was never called, so a
   stale case survived restarts indefinitely.

## The mechanic

**One law break equals one case, and a case belongs to one app.**

A day is a docket. Every case on it moves through verdicts:

| Verdict | Meaning | App state |
| --- | --- | --- |
| `hearing` | Law broken, case filed, awaiting your call | not locked |
| `warning` | You let yourself off with a notice | not locked |
| `jailed` | The app is locked until focus time is served | **locked** |
| `served` | Focus time completed, app released | not locked |
| `dismissed` | Case thrown out (mercy pass or your choice) | not locked |

New cases are appended to the **top** of the docket with a
`HEARING IN PROGRESS` badge. You convert a hearing into a warning or a jail
term. Only `jailed` locks an app, and only the app named on the case.

**Focus time is the only key.** A jailed app cannot be opened until a focus
timer covering that case's `requiredFocusMinutes` completes. Tapping a jailed
app anywhere in the app (the custody strip, the native block fallback) routes to
the focus-timer prompt for that case. Partial sessions bank their elapsed time
into `focusServedSeconds`, so giving up early costs progress but does not erase
it.

**Everything renews at midnight.** The docket carries a `docketDate`. On the
first tick of a new local day the docket clears, per-app daily counters zero
out, and every lock lifts. Fresh start, no carry-over debt.

**The user keeps the master switch.** `enforcementEnabled` lives on the store
and is toggled from the Culprits tab. When it is off, nothing locks and the
native shield is cleared, regardless of docket state.

## State changes

`src/types/court.ts`

- `CourtCase` is rewritten: it is now one case for one app under one law, with
  `verdict`, `requiredFocusMinutes`, and `focusServedSeconds`. The old
  `charges: Charge[]`, `totalSentenceMinutes`, `remainingSentenceSeconds`, and
  `status` fields are gone.
- `Charge` is removed. It duplicated `CourtCase` and was never written.
- `FocusSession` gains `caseId?: string`. A session with a `caseId` serves that
  case; a session without one is free-standing deep work.

`src/store/useCourtStore.ts`

Removed: `activeCase`, `charges`, `activeChargeId`, `acceptSentence`,
`reduceSentence`, `tickSentence`, `resetCourtDay`.

Added: `cases`, `docketDate`, `enforcementEnabled`, `fileCase`, `setVerdict`,
`jailCase`, `warnCase`, `dismissCase`, `tickDocket`, `renewDocket`,
`setEnforcementEnabled`. `startFocusSession(minutes, caseId?)` replaces the
`reducesJail` boolean. `requestMercy(caseId?)` and `grantParole` are kept.

Persistence moves to `version: 2` with a `migrate` that drops any v1
`activeCase`/`charges` payload and starts the user on a clean docket. This is a
deliberate one-time reset of case state only; profile, laws, suspects, parole
records, and premium state all survive.

`src/utils/docket.ts` (new) owns every derivation so no screen re-implements it:
`isCaseOpen`, `jailedCaseForApp`, `jailedAppIds`, `isAppLocked`,
`verdictLabel`, `verdictTone`, `caseFocusRemainingSeconds`.

## Routes

| Route | Change |
| --- | --- |
| `/(tabs)/courtroom` | Now the single Court screen: docket, custody strip, verdict controls, focus CTA, bypass. Absorbs everything Jail did. |
| `/(tabs)/jail` | **Deleted.** |
| `/(tabs)/culprits` | Gains the master enforcement toggle. |
| `/blocked/[appId]` | Rewired to the app's jailed case; primary CTA starts that case's focus timer. |
| `/modals/sentence` | Now the jail-verdict confirmation for a specific case. |
| `/modals/charges-filed` | Now shows a freshly filed case and offers warning / jail / mercy. |
| `/modals/focus-timer` | Accepts a `caseId` param and serves that case on completion. |

Visible tabs go from three to two: **Court** and **Culprits**. Laws, Evidence,
and Parole stay registered and hidden.

## How a case gets filed

Two paths, both real:

1. **`CourtClerk.evaluateNow()`** compares each monitored suspect's
   `dailyUsageMinutes` against the daily limit of the enabled law that governs
   it and files a case when the limit is crossed. It dedupes on
   `date + lawId + appId` so one law break yields one case per day. Runs on the
   global tick.
2. **Attempting to open a monitored app** from the custody strip files the case
   directly. This is the playful loop and it works today without native usage
   data.

Tapping an app that is *already* jailed never files a second case. It opens the
focus-timer prompt.

## Icon removal

All functional icons are gone. That covers SF Symbols rendered through
`expo-image` and emoji used as glyphs in JSX, button titles, and data tables.
Replacements are text labels and `StampBadge`, which keeps every affordance
readable and VoiceOver-friendly.

Product illustrations (`AssetImage` / `FocusCourtAssets` PNGs) are **not**
icons and stay.

`PREMIUM_WHITE_UI.md` previously mandated SF Symbols for functional icons. That
clause is updated here rather than silently violated.

Sites cleared: `(tabs)/_layout.tsx`, `BlockedAppTile`, `DistractionsSection`,
`PremiumGate`, `report.tsx`, `paywall.tsx`, `culprits.tsx`,
`blocked/[appId].tsx`, `focus-timer.tsx`, `unblock.tsx`, `add-app.tsx`,
`select-apps.tsx`, both onboarding permission screens, and `appCatalog.ts`.

## Native boundary

`BlockingBridge` no longer diffs `activeCase.status === 'jailed'`. It diffs
`enforcementEnabled && jailedAppIds(cases).length > 0` and calls the unchanged
`applyImmediateBlock()` / `clearImmediateBlock()`. Native method names, App
Group ids, and entitlements are untouched.

The iOS bridge only supports a global immediate block, so per-app locking is
enforced in-app today and the native shield is all-or-nothing. Wiring
`shieldApp`/`unshieldApp` per selection is follow-up work, noted in
`IOS_ONLY.md`.

## Verification

- `npm run typecheck` passes.
- Route manifest updated in `SCREEN_INVENTORY.md`: 36 route-backed screens, 2
  visible tabs, 3 hidden tab routes, 12 modals.
- No `expo-image` SF Symbol usage and no emoji glyphs remain outside product
  illustration assets.
- Simulator smoke test: file a case, warn it, jail it, confirm the app locks,
  run a focus timer to release it, then confirm the docket clears on a new day.
