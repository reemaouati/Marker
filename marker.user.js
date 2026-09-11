// ==UserScript==
// @name         Marker
// @namespace    https://github.com/reemaouati
// @version      1.0
// @description  Professional text highlighter with glassmorphism design and persistent state.
// @author       reemaouati
// @downloadURL  https://github.com/reemaouati/marker/raw/main/marker.user.js
// @supportURL   https://github.com/reemaouati/marker/issues
// @homepageURL  https://github.com/reemaouati/marker
// @run-at       document-end
// @match        https://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    class MarkerPro {
        // ========================================
        // 1. Constructor & Property Binding
        // ========================================
        constructor() {
            this.colors = ['yellow', 'red', 'orange', 'blue', 'green', 'black'];
            this.state = this.loadState();
            this.ui = null;
            this.isDragging = false;
            this.dragOffset = { x: 0, y: 0 };

            // Bind event handlers to preserve 'this' context
            this.handleMouseDown = this.handleMouseDown.bind(this);
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.handleMouseUp = this.handleMouseUp.bind(this);
            this.handleTouchStart = this.handleTouchStart.bind(this);
            this.handleTouchMove = this.handleTouchMove.bind(this);
            this.handleTouchEnd = this.handleTouchEnd.bind(this);

            this.init();
        }

        // ========================================
        // 2. State Management
        // ========================================
        /**
         * Load persisted state from localStorage with validation
         */
        loadState() {
            try {
                const saved = localStorage.getItem('marker_pro_state');
                const defaults = { colorIndex: 0, pos: { x: 100, y: 100 } };
                
                if (!saved) return defaults;

                const state = JSON.parse(saved);
                
                // Validate position is within current viewport
                state.pos.x = Math.max(0, Math.min(state.pos.x, window.innerWidth - 140));
                state.pos.y = Math.max(0, Math.min(state.pos.y, window.innerHeight - 45));
                
                return state;
            } catch (error) {
                console.warn('Marker: Failed to load state', error);
                return { colorIndex: 0, pos: { x: 100, y: 100 } };
            }
        }

        /**
         * Persist state to localStorage
         */
        saveState() {
            try {
                localStorage.setItem('marker_pro_state', JSON.stringify(this.state));
            } catch (error) {
                console.warn('Marker: Failed to save state', error);
            }
        }

        // ========================================
        // 3. Highlighting Core Logic
        // ========================================
        /**
         * Highlight selected text using Range and DocumentFragment
         * Safely handles complex multi-node selections without DOM corruption
         */
        highlightSelection() {
            try {
                const selection = window.getSelection();
                if (!selection.rangeCount || selection.isCollapsed) return;

                const range = selection.getRangeAt(0);
                const color = this.colors[this.state.colorIndex];
                const textColor = color === 'black' ? 'white' : 'inherit';

                // DocumentFragment prevents partial DOM tree corruption
                const fragment = range.extractContents();
                const wrapper = document.createElement('span');
                
                wrapper.style.backgroundColor = color;
                wrapper.style.color = textColor;
                wrapper.style.fontWeight = '500';
                wrapper.style.transition = 'filter 0.2s';
                wrapper.className = 'marker-highlight';
                wrapper.appendChild(fragment);

                range.insertNode(wrapper);
                selection.removeAllRanges();
            } catch (error) {
                console.warn('Marker: Highlight failed', error);
            }
        }

        /**
         * Remove all highlights and restore original text
         * Normalizes text nodes to merge adjacent nodes
         */
        clearHighlights() {
            try {
                const marks = document.querySelectorAll('.marker-highlight');
                marks.forEach(mark => {
                    const parent = mark.parentNode;
                    while (mark.firstChild) {
                        parent.insertBefore(mark.firstChild, mark);
                    }
                    mark.remove();
                });
                // Merge adjacent text nodes
                document.body.normalize();
            } catch (error) {
                console.warn('Marker: Clear highlights failed', error);
            }
        }

        /**
         * Cycle to next highlight color
         */
        cycleColor() {
            this.state.colorIndex = (this.state.colorIndex + 1) % this.colors.length;
            this.updateIndicator();
            this.saveState();
        }

        /**
         * Update color indicator to reflect current selection
         */
        updateIndicator() {
            const indicator = this.ui?.querySelector('#marker-color-indicator');
            if (indicator) {
                indicator.style.backgroundColor = this.colors[this.state.colorIndex];
            }
        }

        // ========================================
        // 4. UI Creation & Styling
        // ========================================
        /**
         * Inject CSS styles for highlights and glassmorphism UI
         */
        injectStyles() {
            try {
                const style = document.createElement('style');
                style.textContent = `
                    .marker-highlight {
                        cursor: text;
                    }
                    .marker-highlight:hover {
                        filter: brightness(0.9);
                    }
                    #marker-ui-bar {
                        touch-action: none;
                    }
                    #marker-ui-bar button:hover {
                        transform: scale(1.1);
                        background: rgba(255, 255, 255, 0.1);
                    }
                `;
                document.head.appendChild(style);
            } catch (error) {
                console.warn('Marker: Failed to inject styles', error);
            }
        }

        /**
         * Create styled button element safely (prevents XSS)
         */
        createButton(id, title, text, onClick) {
            const button = document.createElement('button');
            button.id = id;
            button.setAttribute('title', title);
            button.textContent = text;
            button.type = 'button';

            // Apply button styles
            Object.assign(button.style, {
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                transition: 'transform 0.1s, background 0.2s',
                color: 'inherit'
            });

            button.addEventListener('click', onClick);
            return button;
        }

        /**
         * Create main UI bar with glassmorphism design
         */
        createUI() {
            this.injectStyles();

            const bar = document.createElement('div');
            bar.id = 'marker-ui-bar';
            
            // Glassmorphism styling
            Object.assign(bar.style, {
                position: 'fixed',
                left: `${this.state.pos.x}px`,
                top: `${this.state.pos.y}px`,
                width: '140px',
                height: '45px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: '25px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                zIndex: '999999',
                cursor: 'grab',
                userSelect: 'none',
                transition: 'box-shadow 0.2s'
            });

            // Create buttons using safe DOM methods (no innerHTML)
            const highlightBtn = this.createButton(
                'marker-btn-high',
                'Highlight',
                '✑',
                () => this.highlightSelection()
            );

            const colorIndicator = this.createButton(
                'marker-color-indicator',
                'Cycle Color',
                '',
                () => this.cycleColor()
            );
            colorIndicator.style.borderWidth = '2px';

            const clearBtn = this.createButton(
                'marker-btn-clear',
                'Clear All',
                '✒',
                () => this.clearHighlights()
            );

            bar.appendChild(highlightBtn);
            bar.appendChild(colorIndicator);
            bar.appendChild(clearBtn);

            this.ui = bar;
            document.body.appendChild(bar);
            this.updateIndicator();
            this.initEvents();
        }

        // ========================================
        // 5. Event Handling (Mouse & Touch)
        // ========================================
        /**
         * Initialize event listeners for UI interactions (mouse & touch)
         */
        initEvents() {
            if (!this.ui) return;
            
            // Mouse events
            this.ui.addEventListener('mousedown', this.handleMouseDown);
            
            // Touch events (mobile browsers)
            this.ui.addEventListener('touchstart', this.handleTouchStart, false);
        }

        /**
         * Handle mouse down on UI bar (start drag)
         */
        handleMouseDown(e) {
            if (!this.ui) return;
            
            // Don't drag if clicking on a button
            if (e.target.tagName === 'BUTTON') return;

            this.isDragging = true;
            this.ui.style.cursor = 'grabbing';
            
            // Calculate offset between click point and element position
            this.dragOffset.x = e.clientX - this.ui.offsetLeft;
            this.dragOffset.y = e.clientY - this.ui.offsetTop;

            // Attach listeners only during drag
            window.addEventListener('mousemove', this.handleMouseMove);
            window.addEventListener('mouseup', this.handleMouseUp);
        }

        /**
         * Handle mouse move while dragging
         */
        handleMouseMove(e) {
            if (!this.isDragging || !this.ui) return;

            let x = e.clientX - this.dragOffset.x;
            let y = e.clientY - this.dragOffset.y;

            // Constrain position within viewport
            const maxX = window.innerWidth - this.ui.offsetWidth;
            const maxY = window.innerHeight - this.ui.offsetHeight;
            
            x = Math.max(0, Math.min(x, maxX));
            y = Math.max(0, Math.min(y, maxY));

            this.ui.style.left = `${x}px`;
            this.ui.style.top = `${y}px`;
            this.state.pos = { x, y };
        }

        /**
         * Handle mouse up (end drag)
         */
        handleMouseUp() {
            if (!this.isDragging) return;

            this.isDragging = false;
            if (this.ui) this.ui.style.cursor = 'grab';

            // Clean up event listeners to prevent memory leaks
            window.removeEventListener('mousemove', this.handleMouseMove);
            window.removeEventListener('mouseup', this.handleMouseUp);

            this.saveState();
        }

        /**
         * Handle touch start on UI bar (mobile drag start)
         */
        handleTouchStart(e) {
            if (!this.ui) return;
            
            // Don't drag if touching a button
            if (e.target.tagName === 'BUTTON') return;

            this.isDragging = true;
            
            // Get touch position
            const touch = e.touches[0];
            this.dragOffset.x = touch.clientX - this.ui.offsetLeft;
            this.dragOffset.y = touch.clientY - this.ui.offsetTop;

            // Attach listeners only during drag
            window.addEventListener('touchmove', this.handleTouchMove, false);
            window.addEventListener('touchend', this.handleTouchEnd, false);
        }

        /**
         * Handle touch move while dragging (mobile)
         */
        handleTouchMove(e) {
            if (!this.isDragging || !this.ui) return;

            // Prevent page scrolling while dragging
            e.preventDefault();

            const touch = e.touches[0];
            let x = touch.clientX - this.dragOffset.x;
            let y = touch.clientY - this.dragOffset.y;

            // Constrain position within viewport
            const maxX = window.innerWidth - this.ui.offsetWidth;
            const maxY = window.innerHeight - this.ui.offsetHeight;
            
            x = Math.max(0, Math.min(x, maxX));
            y = Math.max(0, Math.min(y, maxY));

            this.ui.style.left = `${x}px`;
            this.ui.style.top = `${y}px`;
            this.state.pos = { x, y };
        }

        /**
         * Handle touch end (mobile drag end)
         */
        handleTouchEnd() {
            if (!this.isDragging) return

            // Clean up event listeners to prevent memory leaks
            window.removeEventListener('touchmove', this.handleTouchMove);
            window.removeEventListener('touchend', this.handleTouchEnd);

            this.saveState();
        }

        // ========================================
        // 6. Initialization
        // ========================================
        /**
         * Initialize when DOM is ready
         */
        init() {
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                this.createUI();
            } else {
                window.addEventListener('DOMContentLoaded', () => this.createUI());
            }
        }
    }

    // Instantiate on script load
    new MarkerPro();
})();
