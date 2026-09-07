# 4.2.0 CLEAN FULL APP RC2
- Rebuilt from the **complete** 4.1.1 OFFLINE HOTFIX archive (audio/icons/flags/application included).
- Discarded incomplete CLEAN RC1 is not a valid build.
- Split RallyCross sport core and LapWiz out of the monolithic HTML.
- Current discipline pults retained as UI code.
- Added explicit `commitCurrentEventResult(result)` so UI must supply FIN/DNF/DNS/DSQ instead of core reading DOM.
- Future Rally Sprint and Classic RC remain separate disabled modules.
- Offline cache asset list regenerated for the complete modular application.
