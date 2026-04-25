---
repo_name: Pi
repo_visibility: private
source_type: github
branch: main
commit_sha: 1a669c97bc2760e9298c6ff3d892feea5426fc09
source_path: "docs/pi-vs-claude-code/RESERVED_KEYS.md"
imported_at: "2026-04-25T16:01:56.259Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/Pi/main/docs/pi-vs-claude-code/RESERVED_KEYS.md"
---

# Pi Reserved Keybindings

Extensions **cannot** override these shortcuts — they are silently skipped by `registerShortcut()`.

| Key | Action |
|-----|--------|
| `escape` | interrupt |
| `ctrl+c` | clear / copy |
| `ctrl+d` | exit |
| `ctrl+z` | suspend |
| `shift+tab` | cycleThinkingLevel |
| `ctrl+p` | cycleModelForward |
| `ctrl+shift+p` | cycleModelBackward |
| `ctrl+l` | selectModel |
| `ctrl+o` | expandTools |
| `ctrl+t` | toggleThinking |
| `ctrl+g` | externalEditor |
| `alt+enter` | followUp |
| `enter` | submit / selectConfirm |
| `ctrl+k` | deleteToLineEnd |

## Non-Reserved Built-in Keys

Extensions **can** override these (Pi will warn but allow it).

| Key | Action |
|-----|--------|
| `up` / `down` | cursor / select navigation |
| `left` / `right` | cursor movement |
| `ctrl+a` | cursorLineStart |
| `ctrl+b` | cursorLeft |
| `ctrl+e` | cursorLineEnd |
| `ctrl+f` | cursorRight |
| `ctrl+n` | toggleSessionNamedFilter |
| `ctrl+r` | renameSession |
| `ctrl+s` | toggleSessionSort |
| `ctrl+u` | deleteToLineStart |
| `ctrl+v` | pasteImage |
| `ctrl+w` | deleteWordBackward |
| `ctrl+y` | yank |
| `ctrl+]` | jumpForward |
| `ctrl+-` | undo |
| `ctrl+alt+]` | jumpBackward |
| `alt+b` | cursorWordLeft |
| `alt+d` | deleteWordForward |
| `alt+f` | cursorWordRight |
| `alt+y` | yankPop |
| `alt+up` | dequeue |
| `alt+backspace` | deleteWordBackward |
| `alt+delete` | deleteWordForward |
| `alt+left` / `alt+right` | cursorWord left/right |
| `ctrl+left` / `ctrl+right` | cursorWord left/right |
| `shift+enter` | newLine |
| `home` / `end` | cursorLineStart/End |
| `pageUp` / `pageDown` | page navigation |
| `backspace` | deleteCharBackward |
| `delete` | deleteCharForward |
| `tab` | tab |

## Safe Keys for Extensions

These `ctrl+letter` combos are **free** and work in all terminals:

| Key | Notes |
|-----|-------|
| `ctrl+x` | Safe |
| `ctrl+q` | May be intercepted by terminal (XON/XOFF flow control) |
| `ctrl+h` | Alias for backspace in some terminals — use with caution |

## macOS Notes

- `alt+letter` combos type special characters in most macOS terminals — they don't send alt sequences
- `ctrl+shift+letter` requires Kitty keyboard protocol (Kitty, Ghostty, WezTerm)
- `ctrl+alt+letter` works in legacy terminals but may conflict with macOS system shortcuts
- **Safest bet on macOS:** stick to `ctrl+letter` combos from the free list above, or use `f1`–`f12`
