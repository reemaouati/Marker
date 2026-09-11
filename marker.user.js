// ==UserScript==
// @name         Marker Pro
// @namespace    https://github.com/reemaouati
// @version      1.1
// @description  Professional text highlighter with glassmorphism design, color picker, and persistent state.
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
        constructor() {
            this.state = this.loadState();
            this.ui = null;
            this.isDragging = false;
            this.dragOffset = { x: 0, y: 0 };

            this.handleMouseDown = this.handleMouseDown.bind(this);
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.handleMouseUp = this.handleMouseUp.bind(this);
            this.handleTouchStart = this.handleTouchStart.bind(this);
            this.handleTouchMove = this.handleTouchMove.bind(this);
            this.handleTouchEnd = this.handleTouchEnd.bind(this);

            this.init();
        }

        loadState() {
            try {
                const saved = localStorage.getItem('marker_pro_state');
                const defaults = { color: '#ffff00', pos: { x: 100, y: 100 } };
                
                if (!saved) return defaults;

                const state = JSON.parse(saved);
                
                // التوافقية مع الإصدارات السابقة التي كانت تستخدم colorIndex
                if (state.colorIndex !== undefined) {
                    state.color = defaults.color;
                    delete state.colorIndex;
                }
                
                state.pos.x = Math.max(0, Math.min(state.pos.x, window.innerWidth - 140));
                state.pos.y = Math.max(0, Math.min(state.pos.y, window.innerHeight - 45));
                
                return state;
            } catch (error) {
                console.warn('Marker: Failed to load state', error);
                return { color: '#ffff00', pos: { x: 100, y: 100 } };
            }
        }

        saveState() {
            try {
                localStorage.setItem('marker_pro_state', JSON.stringify(this.state));
            } catch (error) {
                console.warn('Marker: Failed to save state', error);
            }
        }

        // حساب تباين اللون لضمان وضوح النص
        getContrastColor(hexColor) {
            const color = hexColor.replace('#', '');
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);
            const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
            return (yiq >= 128) ? '#000000' : '#ffffff';
        }

        highlightSelection() {
            try {
                const selection = window.getSelection();
                if (!selection.rangeCount || selection.isCollapsed) return;

                const range = selection.getRangeAt(0);
                const color = this.state.color;
                const textColor = this.getContrastColor(color);

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

        clearHighlights() {
            try {
                const selection = window.getSelection();
                let marksToRemove = [];

                if (selection && !selection.isCollapsed) {
                    // تحديد الـ marks المتقاطعة مع النص المحدد فقط
                    const allMarks = document.querySelectorAll('.marker-highlight');
                    allMarks.forEach(mark => {
                        if (selection.containsNode(mark, true)) {
                            marksToRemove.push(mark);
                        }
                    });
                }

                // إذا لم يتم العثور على marks في التحديد أو لم يكن هناك تحديد، احذف الجميع
                if (marksToRemove.length === 0) {
                    marksToRemove = Array.from(document.querySelectorAll('.marker-highlight'));
                }

                marksToRemove.forEach(mark => {
                    const parent = mark.parentNode;
                    while (mark.firstChild) {
                        parent.insertBefore(mark.firstChild, mark);
                    }
                    mark.remove();
                });

                document.body.normalize();
                
                if (selection && !selection.isCollapsed) {
                    selection.removeAllRanges();
                }
            } catch (error) {
                console.warn('Marker: Clear highlights failed', error);
            }
        }

        injectStyles() {
            try {
                // حقن مكتبة Font Awesome
                if (!document.querySelector('link[href*="font-awesome"]')) {
                    const faLink = document.createElement('link');
                    faLink.rel = 'stylesheet';
                    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
                    document.head.appendChild(faLink);
                }

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
                    #marker-ui-bar button, #marker-ui-bar input[type="color"] {
                        transition: transform 0.1s, background 0.2s;
                    }
                    #marker-ui-bar button:hover, #marker-ui-bar input[type="color"]:hover {
                        transform: scale(1.1);
                        background: rgba(255, 255, 255, 0.1);
                    }
                    /* تخصيص مظهر Color Picker */
                    #marker-color-picker {
                        -webkit-appearance: none;
                        -moz-appearance: none;
                        appearance: none;
                        width: 30px;
                        height: 30px;
                        border: 2px solid rgba(255, 255, 255, 0.5);
                        border-radius: 50%;
                        background: transparent;
                        cursor: pointer;
                        padding: 0;
                        overflow: hidden;
                    }
                    #marker-color-picker::-webkit-color-swatch-wrapper {
                        padding: 0;
                    }
                    #marker-color-picker::-webkit-color-swatch {
                        border: none;
                        border-radius: 50%;
                    }
                    #marker-color-picker::-moz-color-swatch {
                        border: none;
                        border-radius: 50%;
                    }
                `;
                document.head.appendChild(style);
            } catch (error) {
                console.warn('Marker: Failed to inject styles', error);
            }
        }

        createButton(id, title, innerHTML, onClick) {
            const button = document.createElement('button');
            button.id = id;
            button.setAttribute('title', title);
            button.innerHTML = innerHTML;
            button.type = 'button';

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
                fontSize: '14px',
                color: '#333' // لون الإيقونات الافتراضي
            });

            button.addEventListener('click', onClick);
            return button;
        }

        createColorPicker() {
            const picker = document.createElement('input');
            picker.type = 'color';
            picker.id = 'marker-color-picker';
            picker.value = this.state.color;
            picker.title = 'Choose Color';

            picker.addEventListener('input', (e) => {
                this.state.color = e.target.value;
                this.saveState();
            });

            return picker;
        }

        createUI() {
            this.injectStyles();

            const bar = document.createElement('div');
            bar.id = 'marker-ui-bar';
            
            Object.assign(bar.style, {
                position: 'fixed',
                left: `${this.state.pos.x}px`,
                top: `${this.state.pos.y}px`,
                width: '140px',
                height: '45px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                background: 'rgba(255, 255, 255, 0.4)', // زيادة العتامة لبروز الإيقونات
                backdropFilter: 'blur(10px)',
                borderRadius: '25px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                zIndex: '999999',
                cursor: 'grab',
                userSelect: 'none'
            });

            const highlightBtn = this.createButton(
                'marker-btn-high',
                'Highlight',
                '<i class="fa-solid fa-highlighter"></i>',
                () => this.highlightSelection()
            );

            const colorPicker = this.createColorPicker();

            const clearBtn = this.createButton(
                'marker-btn-clear',
                'Clear',
                '<i class="fa-solid fa-eraser"></i>',
                () => this.clearHighlights()
            );

            bar.appendChild(highlightBtn);
            bar.appendChild(colorPicker);
            bar.appendChild(clearBtn);

            this.ui = bar;
            document.body.appendChild(bar);
            this.initEvents();
        }

        initEvents() {
            if (!this.ui) return;
            this.ui.addEventListener('mousedown', this.handleMouseDown);
            this.ui.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        }

        handleMouseDown(e) {
            if (!this.ui || e.target.closest('button, input')) return;

            this.isDragging = true;
            this.ui.style.cursor = 'grabbing';
            this.dragOffset.x = e.clientX - this.ui.offsetLeft;
            this.dragOffset.y = e.clientY - this.ui.offsetTop;

            window.addEventListener('mousemove', this.handleMouseMove);
            window.addEventListener('mouseup', this.handleMouseUp);
        }

        handleMouseMove(e) {
            if (!this.isDragging || !this.ui) return;

            let x = e.clientX - this.dragOffset.x;
            let y = e.clientY - this.dragOffset.y;
            
            x = Math.max(0, Math.min(x, window.innerWidth - this.ui.offsetWidth));
            y = Math.max(0, Math.min(y, window.innerHeight - this.ui.offsetHeight));

            this.ui.style.left = `${x}px`;
            this.ui.style.top = `${y}px`;
            this.state.pos = { x, y };
        }

        handleMouseUp() {
            if (!this.isDragging) return;
            this.isDragging = false;
            if (this.ui) this.ui.style.cursor = 'grab';

            window.removeEventListener('mousemove', this.handleMouseMove);
            window.removeEventListener('mouseup', this.handleMouseUp);
            this.saveState();
        }

        handleTouchStart(e) {
            if (!this.ui || e.target.closest('button, input')) return;

            this.isDragging = true;
            const touch = e.touches[0];
            this.dragOffset.x = touch.clientX - this.ui.offsetLeft;
            this.dragOffset.y = touch.clientY - this.ui.offsetTop;

            window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
            window.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        }

        handleTouchMove(e) {
            if (!this.isDragging || !this.ui) return;
            e.preventDefault();

            const touch = e.touches[0];
            let x = touch.clientX - this.dragOffset.x;
            let y = touch.clientY - this.dragOffset.y;

            x = Math.max(0, Math.min(x, window.innerWidth - this.ui.offsetWidth));
            y = Math.max(0, Math.min(y, window.innerHeight - this.ui.offsetHeight));

            this.ui.style.left = `${x}px`;
            this.ui.style.top = `${y}px`;
            this.state.pos = { x, y };
        }

        handleTouchEnd() {
            if (!this.isDragging) return;
            this.isDragging = false;
            window.removeEventListener('touchmove', this.handleTouchMove);
            window.removeEventListener('touchend', this.handleTouchEnd);
            this.saveState();
        }

        init() {
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                this.createUI();
            } else {
                window.addEventListener('DOMContentLoaded', () => this.createUI());
            }
        }
    }

    new MarkerPro();
})();
