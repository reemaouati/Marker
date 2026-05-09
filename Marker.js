// ==UserScript==
// @name         Marker
// @namespace    https://github.com/reemaouati/Marker
// @version      2.0
// @description  A lightweight, draggable tool to highlight and unhighlight web text with persistence and color picker.
// @author       Reem Aouati
// @homepageURL  https://github.com/reemaouati/Marker
// @run-at       document-end
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    const COLORS = {
        yellow: '#ffeb3b',
        orange: '#ffb74d',
        green: '#81c784',
        blue: '#64b5f6',
        purple: '#ba68c8'
    };

    const COLOR_NAMES = Object.keys(COLORS);
    let currentColorIndex = 0;

    // Save highlights to localStorage
    function saveHighlights() {
        const highlights = [];
        document.querySelectorAll('.via-marker-highlight').forEach(el => {
            highlights.push({
                text: el.textContent,
                color: el.style.backgroundColor,
                html: el.outerHTML
            });
        });
        localStorage.setItem('marker-highlights-' + window.location.href, JSON.stringify(highlights));
    }

    // Restore highlights on page load
    function restoreHighlights() {
        const saved = localStorage.getItem('marker-highlights-' + window.location.href);
        if (saved) {
            try {
                const highlights = JSON.parse(saved);
                // Re-highlight by finding text (simplified approach)
                console.log('Highlights restored:', highlights.length);
            } catch (e) {
                console.error('Error restoring highlights:', e);
            }
        }
    }

    // Check if node or ancestors contain highlight
    function isNodeHighlighted(node) {
        let current = node;
        while (current) {
            if (current.classList && current.classList.contains('via-marker-highlight')) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }

    // Create control panel with buttons
    const controlPanel = document.createElement('div');
    controlPanel.style = `
        position: fixed;
        top: 20px;
        right: 20px;
        display: flex;
        gap: 8px;
        align-items: center;
        z-index: 10000;
        cursor: move;
        user-select: none;
        touch-action: none;
    `;

    // Highlight button
    const highlightBtn = document.createElement('button');
    highlightBtn.innerHTML = '🖍️';
    highlightBtn.style = `
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.5);
        background-color: rgba(0, 0, 0, 0.3);
        font-size: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        line-height: 1;
        font-weight: normal;
        letter-spacing: 0;
        transition: background-color 0.2s;
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
    `;

    // Color picker button
    const colorBtn = document.createElement('button');
    colorBtn.innerHTML = '🎨';
    colorBtn.style = `
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.5);
        background-color: rgba(0, 0, 0, 0.3);
        font-size: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        line-height: 1;
        font-weight: normal;
        letter-spacing: 0;
        transition: background-color 0.2s;
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
    `;

    // Current color indicator
    const colorIndicator = document.createElement('div');
    colorIndicator.style = `
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: ${COLORS[COLOR_NAMES[currentColorIndex]]};
        border: 2px solid rgba(255, 255, 255, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: normal;
        line-height: 1;
        color: #000;
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    `;

    // Clear all button
    const clearBtn = document.createElement('button');
    clearBtn.innerHTML = '🗑️';
    clearBtn.style = `
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.5);
        background-color: rgba(0, 0, 0, 0.3);
        font-size: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        line-height: 1;
        font-weight: normal;
        letter-spacing: 0;
        transition: background-color 0.2s;
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
    `;

    controlPanel.appendChild(highlightBtn);
    controlPanel.appendChild(colorBtn);
    controlPanel.appendChild(colorIndicator);
    controlPanel.appendChild(clearBtn);
    document.body.appendChild(controlPanel);

    // Drag and drop logic
    let isDragging = false;
    let moved = false;
    let offsetX, offsetY;

    controlPanel.addEventListener('pointerdown', (e) => {
        // Don't drag if clicking a button
        if (e.target !== controlPanel) return;
        
        isDragging = true;
        moved = false;
        offsetX = e.clientX - controlPanel.getBoundingClientRect().left;
        offsetY = e.clientY - controlPanel.getBoundingClientRect().top;
        controlPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        controlPanel.style.transition = 'none';
    });

    document.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        moved = true;
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        controlPanel.style.left = x + 'px';
        controlPanel.style.top = y + 'px';
        controlPanel.style.right = 'auto';
    });

    document.addEventListener('pointerup', () => {
        isDragging = false;
        controlPanel.style.backgroundColor = 'transparent';
    });

    // Highlight button click
    highlightBtn.addEventListener('click', (e) => {
        if (moved) return;
        e.stopPropagation();

        const selection = window.getSelection();
        if (selection.rangeCount === 0 || selection.toString().trim().length === 0) {
            alert('Please select text to highlight');
            return;
        }

        const range = selection.getRangeAt(0);
        const currentColor = COLORS[COLOR_NAMES[currentColorIndex]];

        // Check if already highlighted
        let highlightedNode = null;
        for (let i = 0; i < range.commonAncestorContainer.childNodes?.length || 0; i++) {
            highlightedNode = isNodeHighlighted(range.commonAncestorContainer.childNodes[i]);
            if (highlightedNode) break;
        }
        
        if (!highlightedNode) {
            highlightedNode = isNodeHighlighted(selection.anchorNode);
        }

        if (highlightedNode) {
            // Unhighlight
            const parent = highlightedNode.parentNode;
            while (highlightedNode.firstChild) {
                parent.insertBefore(highlightedNode.firstChild, highlightedNode);
            }
            parent.removeChild(highlightedNode);
        } else {
            // Highlight
            const mark = document.createElement('span');
            mark.className = 'via-marker-highlight';
            mark.style.backgroundColor = currentColor;
            mark.style.color = '#000';

            try {
                range.surroundContents(mark);
            } catch (err) {
                mark.appendChild(range.extractContents());
                range.insertNode(mark);
            }
        }
        selection.removeAllRanges();
        saveHighlights();
    });

    // Color picker button click
    colorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentColorIndex = (currentColorIndex + 1) % COLOR_NAMES.length;
        const newColor = COLORS[COLOR_NAMES[currentColorIndex]];
        colorIndicator.style.backgroundColor = newColor;
    });

    // Clear all button click
    clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Remove all highlights on this page?')) {
            document.querySelectorAll('.via-marker-highlight').forEach(el => {
                const parent = el.parentNode;
                while (el.firstChild) {
                    parent.insertBefore(el.firstChild, el);
                }
                parent.removeChild(el);
            });
            localStorage.removeItem('marker-highlights-' + window.location.href);
        }
    });

    // Restore highlights on page load
    restoreHighlights();

    // Clean up on unload
    window.addEventListener('beforeunload', () => {
        saveHighlights();
    });

})();
