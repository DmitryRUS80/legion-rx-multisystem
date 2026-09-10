# LEGION RX 4.2.0 CLEAN FULL APP RC34 · LIVE PILOT STATS BROADCAST

Direct code base: **RC33 PILOT LAP STATS UI**.

## RC34 current release

RC34 refines only the pilot lap-statistics presentation introduced in RC33. In landscape the live card is approximately half of the roster width and never covers the right timer/control pult; in portrait it may use the available roster width, which already ends above the lower controls. The header uses shared avatar/flag/team markup, a colored LapWiz transponder ID tile, the full pilot name, and compact broadcast labels `POS / BEST / AVG` plus live `LAPS / TIME`. While the card is open it is refreshed by the existing RallyCross / Free Practice UI tickers, so position, elapsed time, average, laps and newly completed lap rows continue changing in real time. Lap rows remain neutral/translucent with white values; only BEST text is green and WORST text is magenta. The old yellow average-lap highlight is removed. The roster under the card stays visible and live through a very light dim/blur. No sport, LapWiz, audio, storage or reporting code is changed.

## RC33 previous release

RC33 is a UI-only replacement of the pilot lap-statistics window. During active RallyCross and Free Practice, tapping a pilot opens a compact branded overlay constrained to the roster area only; the timer/control pult is never covered. The hero reuses the pilot-card avatar/flag/team language and shows current PLACE / BEST / AVG with normal foreground values. Lap rows are flat cockpit rows: BEST green, the lap closest to AVG yellow, WORST magenta. Free Practice judge lap deletion and correction history are preserved. The old lap-summary cards/table/modal styling is removed from this component rather than overridden. RallyCross scoring/runtime, RC30 start order/announcer, RC31 column repair, RC32 skip safety, LapWiz, audio, storage and reporting are unchanged.

## RC32 current release

RC32 is a focused RallyCross administrative-state repair over RC31. Normal qualification/final scoring and genuine RC29 run-offs are unchanged. The repair prevents skipped/cancelled events from manufacturing fake ties, prevents empty downstream LCQ events, blocks mandatory run-offs from being skipped into retry loops, and restores a deterministic force-finish path that always leaves the competition archiveable. RC30 start order/announcer, RC31 cockpit column repair, Free Practice, LapWiz, storage and reporting remain untouched.

## RC31 current release

- Restores the intended GAP / ✓ / BEST / AVG / LAST / LAPS display toggles in the shared RallyCross / Free Practice cockpit.
- The existing `rxnHide-*` state classes now hide the matching grid cells in the one authoritative cockpit stylesheet, keeping every pilot row on one grid row when metrics are disabled.
- No alternate layout layer, override stylesheet or second renderer was added.
- RC30 official start order / announcer order and the thin neutral pilot/model selection outline are preserved unchanged.
- RC29 run-off rules, scoring, Free Practice sport core, LapWiz, iOS START/storage safety, offline-update behavior and reporting are unchanged.


RC22 is an isolated pilot-UI rebuild. It replaces the old pilot database card and race pilot picker instead of styling over them.

## New pilot UI

- translucent tile-based pilot cards;
- large avatar area + flag + uppercase pilot name;
- display-only GAMES / WINS / RECORDS counters from saved archive data;
- per-pilot model tiles containing class, model, ID/number, transponder and color;
- small corner edit icon only;
- expanding blurred editor overlay for identity/avatar/garage;
- race setup: tap a model tile to add it, tap again to remove it, tap another model to replace the selected model for that pilot;
- existing local pilot-name announcer controls are preserved inside the editor.

Legacy pilot profiles remain compatible: a profile without `models[]` is represented by one fallback primary model using its existing transponder.

## Not part of RC22

Post-finish TOP-3 cards are **not** included yet. They stay as the next separate visual task after the pilot database/card workflow is accepted.

## Protected functionality

- RallyCross sport rules / qualification / finals / finish policy: **NO CHANGE**;
- Free Practice sport logic: **NO CHANGE**;
- LapWiz protocol: **NO CHANGE**;
- RC21 iPhone START/audio safety: **NO CHANGE**;
- staged offline updater: behavior **NO CHANGE** (RC22 release namespace/assets only);
- reporting contract: **NO CHANGE**.

See `TEST_REPORT.md` for verification and real-device acceptance checks.


## RC23 correction
RC23 is a focused UI correction over RC22. Pilot cards follow the user-approved sketch; model tiles are simplified, non-shaking and use neutral glass selection. The same model mini-card is now used in RallyCross event setup. Sport/platform logic is unchanged.


## RC24 glass correction
RC24 keeps the RC23 pilot-card architecture but removes the nested rounded-box look. Avatar areas are square and frameless, flags are flat in the lower-right corner, model strips are flat cockpit-style ID labels, and selected participants in RallyCross setup are compact portrait tiles instead of long rows. Selection remains tap-to-toggle with a neutral glass highlight and no shake. Sport/platform logic is unchanged.


## RC25 compact pilot workflow
- Pilot database: 4–5 compact glass tiles per desktop row; 2–3 per portrait mobile/tablet depending on width.
- Photos use square centered cover-crop; placeholder remains the neutral human silhouette.
- Race picker: compact portrait cards with ID stickers instead of wide pilot rows.
- Model tap updates selection in-place; the picker is not rebuilt and does not shake.
- Model editor has one `ID LAPWIZ` field. That value is the transponder ID used by LapWiz and is mirrored into legacy `number`/`transponder` properties only for compatibility with the unchanged core.
- Editor guide-lines and duplicate transponder input are removed; labels are larger and closer to values.

Sport/platform/offline/audio/reporting logic is unchanged.


## RC26 pilot/practice workflow
- Avatar upload creates a centered square crop based on the short image side; vertical and horizontal photos no longer drift inside the square.
- Pilot card team label sits inside the avatar at lower-left; no team means no label. Flag remains lower-right.
- RallyCross model selection shows model class beneath the colored LapWiz ID square.
- Free Practice now uses the same compact pilot/model selection tiles instead of the old checkbox/list rows. The chosen model's LapWiz ID is used for the Track Day participant.
- Sport modules, LapWiz protocol, audio safety, staged offline updater and reporting are unchanged.


### RC26 additional UI behavior
- App pages have no legacy stripe background. Settings can apply a solid background color or a locally stored background image immediately.
- Dark/light mode applies immediately.
- Existing pilot model color applies/persists immediately from the color picker.
- Completed-race “ЗАВЕРШИТЬ” uses an in-app confirmation path for iPhone/Safari reliability.

## RC27 practice/theme UI pass

- Free Practice selected pilot and selected model tiles glow around their existing perimeter without adding layout frames.
- A custom page background color is stored as the chosen base hue and automatically rendered as a dark or light variant when the theme changes.
- The model editor color square shows the current LapWiz ID live while the ID is typed.
- Sport modules and LapWiz protocol are unchanged.


## RC28 manual cockpit cards + iPhone finish storage safety
- Manual pass/lap dialogs in RallyCross and Free Practice use the same compact pilot tile: LapWiz ID square, uppercase name, flag and lap count.
- Old initials-based manual picker visuals are removed.
- iPhone race completion no longer archives duplicate base64 pilot photos. Existing old snapshots are compacted automatically.
- If Safari storage is still genuinely full after compaction, the race stays active/completed instead of being cleared, and the operator is told that local storage must be freed.
- Sport rules, LapWiz protocol and reporting are unchanged.


## RC29 RallyCross tie resolution
- Removed the qualification random draw.
- Qualification exact equality now automatically creates a run-off containing only the tied pilots. The run-off adds no Q points and does not become an extra qualification result.
- Final A BEST-2 equality is resolved by best counted place, then laps/time of that result, then the second counted result and its laps/time.
- Only an exact remaining equality creates a Final A run-off. The run-off does not become A4 and has no bonus points; it only fixes the order inside the disputed final positions.
- Normal event/championship points are assigned after that final order is known.
- Free Practice, LapWiz protocol, audio, storage, reporting and RC28 iPhone quota safety are unchanged.
