# LEGION RX 4.2.0 CLEAN FULL APP RC26 · PILOT FLOW & UI SAFETY

Direct code base: **RC25 COMPACT PILOT GRID**.

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
