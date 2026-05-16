# 🦜 Parrot Mirror

YouTube looping + speed control extension.

## Features
- A→B loop playback (default +3s window)
- Editable start/end timestamps (MM:SS.mmm)
- Speed control (0.25x–3x in 0.05 steps)
- YouTube-native UI under video
- Keyboard shortcuts

## Keyboard Shortcuts

- Alt + L → Toggle loop
- Alt + S → Set start time to current playback
- Alt + E → Set end time to current playback
- Alt + , → Slow down speed
- Alt + . → Speed up

## Behavior Rules

- Loop defaults to currentTime → currentTime + 3s
- Editing start/end overrides auto loop values
- Changing speed resets per video (no persistence)
- Seeking disables loop automatically
- No support for YouTube Shorts