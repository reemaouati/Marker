# Marker

A professional text highlighter userscript with glassmorphism design, persistent state management, and full cross-platform support for desktop and mobile browsers.

## Features

- **6 Color Palette**: Yellow, red, orange, blue, green, and black highlighting options
- **Glassmorphism UI**: Modern frosted glass design with blur effects
- **Full Touch Support**: Works seamlessly on Android browsers (Via, Soul, etc.)
- **Persistent State**: Automatically saves color selection and UI position
- **Safe DOM Manipulation**: Uses DocumentFragment to prevent DOM corruption
- **Zero Dependencies**: Pure vanilla JavaScript, no external libraries
- **XSS Protected**: Safe DOM creation methods, no innerHTML injection
- **Memory Efficient**: Proper event listener cleanup prevents memory leaks

## Installation

### Prerequisites
Install a userscript manager:
- [Tampermonkey](https://www.tampermonkey.net/) - Chrome, Firefox, Edge, Safari
- [Violentmonkey](https://violentmonkey.github.io/) - Firefox, Chrome
- [Greasemonkey](https://www.greasespot.net/) - Firefox

### Steps
1. Open your userscript manager
2. Create a new userscript
3. Copy and paste the entire `marker.user.js` code
4. Save and enable

## Usage

| Button | Action |
|--------|--------|
| **✑** | Highlight selected text with current color |
| **●** (Color Circle) | Cycle through available highlight colors |
| **✒** | Remove all highlights from page |
| **Bar** | Drag to reposition the UI anywhere on screen |

### Workflow
1. Select text on any webpage
2. Click the **✑** button to highlight it
3. Click the **●** button to change colors
4. Click the **✒** button to clear all highlights
5. Drag the bar to move it around

## Cross-Platform Support

**Desktop Browsers**
- Chrome/Chromium (with Tampermonkey)
- Firefox (with Tampermonkey/Violentmonkey)
- Edge (with Tampermonkey)
- Safari (with Tampermonkey)

**Mobile Browsers**
- Via Browser (Android)
- Soul Browser (Android)

## Technical Highlights

- **Safe DOM Operations**: Uses `DocumentFragment` and `textContent` to prevent XSS
- **Event Management**: Proper listener attachment/removal prevents memory leaks
- **State Persistence**: localStorage with viewport validation
- **Touch Events**: Full support for mouse and touch drag-and-drop
- **Error Handling**: Try-catch blocks with console warnings for debugging

## Settings Storage

All settings are saved to `localStorage` under the key `marker_pro_state`:
```json
{
  "colorIndex": 0,
  "pos": { "x": 100, "y": 100 }
}
```

**Note:** Clearing browser data will reset these settings.

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome | Full |
| Firefox | Full |
| Edge | Full |
| Safari | Full |
| Mobile Chrome | Full |
| Mobile Firefox | Full |
| Via Browser | Full |
| Soul Browser | Full |

## License

Created by [@reemaouati](https://github.com/reemaouati)

## Support

Found a bug or have a feature request? [Open an issue on GitHub](https://github.com/reemaouati/marker/issues)

---

**Made with ❤️ for better web reading experience**
