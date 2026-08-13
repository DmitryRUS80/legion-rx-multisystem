# Legion RX 4.0.12 Alpha — Mobile Audio Fix

- 4.0.11 Web Audio fetch/decode engine removed after field regression: no sound on mobile PWA.
- Restored native HTMLMediaElement playback, proven in 4.0.10, but reorganized as a persistent audio engine.
- Separate persistent VOICE player, HORN player and 8-channel BLEEP pool.
- Added `audio/system/silence.wav` used to prime mobile audio on first user gesture.
- Added manual “Разбудить звук” diagnostic action.
- Audio state remains visible in settings/widgets.
- Warmup, Free Practice, race timing and sports logic unchanged.
- PWA cache bumped to `legion-rx-4-0-12-alpha-mobile-audio-fix-1`.
