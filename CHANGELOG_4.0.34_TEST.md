# Legion RX 4.0.34 TEST — Local Pilot Voice

- Removed APIHOST, API keys, proxy settings and every paid/network dependency.
- Added local MP3, WAV and OGG upload in the pilot profile.
- Added playback, replacement and deletion controls.
- Audio is stored in IndexedDB by permanent pilot ID; metadata stays in the pilot profile.
- Added a 5 MB file limit and audio format validation.
- Pilot names are queued without overlap.
- Name events: start call, new heat-best lap, individual finish and saved heat results.
- Changing the pilot name marks the recording as requiring replacement.
- Deleting a pilot also deletes the saved audio.
- Sports timing, standings, progression, BLE protocol and LapWiz rules are unchanged.
