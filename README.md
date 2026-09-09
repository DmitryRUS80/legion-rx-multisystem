# LEGION RX 4.2.0 CLEAN FULL APP RC23 · PILOT CARDS CORRECTION

Direct code base: **RC21 IOS START SAFETY**.

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
