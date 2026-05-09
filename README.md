# Marker
**Marker: Highlight with Ease**

**Marker** is a lightweight tool designed for one thing: making web reading better. It adds a sleek, draggable floating control panel to your browser that lets you highlight important text, change colors, and manage your highlights effortlessly.

## Features
- **🖍️ Simple Highlighting:** Select any text and tap the highlight button to mark it.
- **🎨 Color Picker:** Choose from 5 highlight colors (yellow, orange, green, blue, purple) - click the palette icon to cycle through.
- **🗑️ Clear All:** Remove all highlights on the current page with one click.
- **📍 Persistence:** Your highlights are saved and restored when you revisit the page.
- **💾 Automatic Save:** Highlights persist across browser sessions using localStorage.
- **Fully Draggable:** Move the control panel anywhere on your screen so it's always within reach but never in the way.
- **Minimalist Design:** Transparent, "glass-style" UI that stays out of your focus until you need it.

## Install
Import script from URL:
```
https://raw.githubusercontent.com/reemaouati/Marker/refs/heads/main/Marker.js
```

## How to Use

### Highlighting Text
1. Select any text on the page
2. Click the 🖍️ icon to highlight it
3. Click the 🎨 icon to choose a different color
4. Click the 🗑️ icon to clear all highlights

### Changing Colors
- Click the 🎨 palette icon to cycle through 5 colors
- The color indicator shows your current highlight color
- New highlights will use the selected color

### Managing Highlights
- Click 🖍️ again on highlighted text to remove that highlight
- Click 🗑️ to remove all highlights on the page at once
- Highlights are automatically saved to your browser

### Moving the Panel
- Click and drag anywhere on the control panel to move it
- Drag to reposition and release to place it where you want

## Browser
- Tested on [Via](https://viayoo.com/en/)
- Tested on [Soul](https://play.google.com/store/apps/details?id=com.mycompany.app.soulbrowser&hl=en)
- Works on any browser with Userscript support (Tampermonkey, Greasemonkey, etc.)

## Tips
>[!TIP]
>Select any text and tap the 🖍️ icon to highlight it with the current color.

>[!TIP]
>Click the 🎨 palette icon to cycle through 5 different highlight colors.

>[!TIP]
>Click the 🗑️ trash icon to remove all highlights on the page.

>[!NOTE]
>Your highlights are automatically saved and will be restored when you revisit the page.

>[!NOTE]
>Move the control panel anywhere on your screen by clicking and dragging it.

## Version History

### v2.0
- ✨ Added color picker with 5 colors
- ✨ Added "Clear All" button
- ✨ Added highlight persistence (localStorage)
- 🐛 Fixed icon alignment and sizing
- 📈 Improved unhighlight detection for complex selections
- 🎨 Better UI with organized control panel

### v1.0
- Initial release with basic highlighting functionality

Userscript is licensed under [WTFPL license](LICENSE).
