// ==UserScript==
// @name         Marker
// @namespace    https://github.com/reemaouati/Marker
// @version      1.0
// @description  A lightweight, draggable tool to highlight and unhighlight web text.
// @author       Reem Aouati
// @homepageURL  https://github.com/reemaouati/Marker
// @run-at       document-end
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 1. Create the floating circular button
    const marker = document.createElement('div');
    marker.innerHTML = '🖍️';
    marker.setAttribute('title', 'Drag to move, click to highlight');
    marker.style = `
        position: fixed;
        top: 20%;
        right: 20px;
        width: 50px;
        height: 50px;
        background-color: rgba(0, 0, 0, 0.3);
        border: 2px solid rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        cursor: move;
        z-index: 10000;
        user-select: none;
        touch-action: none;
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
    `;
    document.body.appendChild(marker);

    // 2. Drag and Drop Logic
    let isDragging = false;
    let moved = false;
    let offsetX, offsetY;

    marker.addEventListener('pointerdown', (e) => {
        isDragging = true;
        moved = false;
        offsetX = e.clientX - marker.getBoundingClientRect().left;
        offsetY = e.clientY - marker.getBoundingClientRect().top;
        marker.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        marker.style.transition = 'none'; // Instant movement while dragging
    });

    document.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        moved = true;
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        marker.style.left = x + 'px';
        marker.style.top = y + 'px';
        marker.style.right = 'auto';
    });

    document.addEventListener('pointerup', () => {
        isDragging = false;
        marker.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    });

    // 3. Highlight/Unhighlight Logic
    marker.addEventListener('click', () => {
        if (moved) return;

        const selection = window.getSelection();
        if (selection.rangeCount === 0 || selection.toString().trim().length === 0) return;

        const container = selection.anchorNode.parentElement;

        // Check if the selection is already inside a marker-made highlight
        if (container.classList.contains('via-marker-highlight')) {
            const parent = container.parentNode;
            while (container.firstChild) {
                parent.insertBefore(container.firstChild, container);
            }
            parent.removeChild(container);
        } else {
            const range = selection.getRangeAt(0);
            const mark = document.createElement('span');
            mark.className = 'via-marker-highlight';
            mark.style.backgroundColor = '#ffeb3b';
            mark.style.color = '#000';

            try {
                range.surroundContents(mark);
            } catch (err) {
                mark.appendChild(range.extractContents());
                range.insertNode(mark);
            }
        }
        selection.removeAllRanges();
    });

})();
