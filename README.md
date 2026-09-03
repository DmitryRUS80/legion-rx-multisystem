# Legion RX 4.0.45 UI TEST

This is an isolated RallyCross UI test rebuilt from the approved dark reference sketch. The saved Legion RX UI Lab JSON profile is applied to desktop, compact desktop, tablet, phone landscape and phone portrait layouts. Existing race, LapWiz and announcer logic is preserved.

All 249 pilot country flags are stored in one offline PNG atlas instead of hundreds of separate SVG files. They render consistently on Windows, Android and iOS, and Russia remains the first country in the pilot selector. The GitHub deployment package contains only current runtime files.

Local Pilot Voice: MP3, WAV or OGG recordings of pilot names are loaded in the pilot profile and stored offline in IndexedDB by permanent pilot ID. No account, API, payment, server or internet connection is required.

The saved name and the supplied race-announcer WAV files share one playback queue. The start flow uses the dedicated “one minute to start” recording, then call to start, pilot names, “Good race”, configurable countdown to 1, and HORN. The “one minute remaining in the heat” recording now plays only during a timed race. A new heat-best lap announces the phrase and pilot name without reading seconds or milliseconds. Finish, results and service messages can be enabled separately in Settings.
