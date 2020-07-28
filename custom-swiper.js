"use strict";

console.log('custom swiper init');

class ThreeBlockSwiper {
    constructor({el = '[data-selector="3-block-swiper"]'} = {}) {
        const rootEl = document.querySelector(el);
        this.$refs = {
            body: document.body,
            rootEl,
            prevSlidesWrapper: rootEl.querySelector('[data-prev-slides-wrapper]'),
            nextSlidesWrapper: rootEl.querySelector('[data-next-slides-wrapper]'),
            prevSlideTrigger: rootEl.querySelectorAll('[prev-slide-trigger]'),
            currentSlideTrigger: rootEl.querySelectorAll('[data-current-slide-trigger]'),
            nextSlideTrigger: rootEl.querySelectorAll('[next-slide-trigger]'),
            prevImgWrapper: rootEl.querySelectorAll('[data-prev-img]'),
            currImgWrapper: rootEl.querySelectorAll('[data-current-img]'),
            nextImgWrapper: rootEl.querySelectorAll('[data-next-img]'),
            prevTitle: rootEl.querySelectorAll('[data-prev-title]'),
            currTitle: rootEl.querySelectorAll('[data-current-title]'),
            nextTitle: rootEl.querySelectorAll('[data-next-title]'),
            futureTitle: rootEl.querySelectorAll('[data-future-title]'),
            currDescription: rootEl.querySelectorAll('[data-current-desc]'),
            nextDescription: rootEl.querySelectorAll('[data-next-desc]'),
            cursor: document.querySelector('[data-selector="custom-cursor"]')
        };
        this.$state = {
            currentSlide: 0
        };
        this.$watch = {
            currentSlide: (newValue, prevValue) => {
                this.setMainViewIndexTo(newValue);
                this.setPointerEvents(this.$refs.prevSlidesWrapper, this.isPrevSlideAvailable() ? '' : 'none');
                this.setPointerEvents(this.$refs.nextSlidesWrapper, this.isNextSlideAvailable() ? '' : 'none');
            }
        };
        this.lastSlideIndex = this.$refs.currImgWrapper.length - 1;
        this.setCursorTextTimeout = -1;
        this.handleCursorClickTimeout = -1;
        // Touch swiper
        this.xDown = null;
        this.yDown = null;
        this.element = document.querySelector(el);

        this.element.addEventListener('touchstart', function (evt) {
            this.xDown = evt.touches[0].clientX;
            this.yDown = evt.touches[0].clientY;
        }.bind(this), false);
    }

    handleSlideChange(dir) {
        let newVal;

        if (dir === 'prev') {
            newVal = Math.max(this.$state.currentSlide - 1, 0);
        } else if (dir === 'next') {
            newVal = Math.min(this.$state.currentSlide + 1, this.lastSlideIndex);
        }

        this.$state.currentSlide = newVal;
    }

    toggleElements(collection, indexToShow, lastHideTopReverse) {
        collection.forEach((el, i) => {
            const isLast = i === collection.length - 1;

            if (lastHideTopReverse) {
                if (isLast) {
                    return el.classList.add('-hide-top-reverse');
                } else {
                    return el.classList.add('-visibility-hidden');
                }
            }

            if (i < indexToShow) {
                el.classList.add('-hide-bottom');
            } else if (i === indexToShow) {
                el.classList.remove('-visibility-hidden');
                raf(() => {
                    el.classList.remove('-hide-bottom', '-hide-top', '-hide-top-reverse');
                });
            } else if (i > indexToShow) {
                el.classList.add('-hide-top');
            }
        });
    }

    setMainViewIndexTo(index) {
        this.toggleElements(this.$refs.prevTitle, index - 1);
        this.toggleElements(this.$refs.prevImgWrapper, index - 1);
        this.toggleElements(this.$refs.currTitle, index);
        this.toggleElements(this.$refs.currDescription, index);
        this.toggleElements(this.$refs.currImgWrapper, index);
        this.toggleElements(this.$refs.nextImgWrapper, index + 1, index === this.$refs.nextImgWrapper.length - 1);
        this.toggleElements(this.$refs.nextTitle, index + 1);
        this.toggleElements(this.$refs.nextDescription, index + 1);
        this.toggleElements(this.$refs.futureTitle, index + 2);
    }

    isNextSlideAvailable() {
        return this.$state.currentSlide < this.lastSlideIndex;
    }

    isPrevSlideAvailable() {
        return this.$state.currentSlide > 0;
    }

    setCursorText(text) {
        const set = () => this.$refs.cursor.innerHTML = '<span>' + text + '</span>';

        if (!text) {
            this.setCursorTextTimeout = setTimeout(() => {
                set();
            }, 200);
        } else {
            clearTimeout(this.setCursorTextTimeout);
            set();
        }
    }

    scaleUpImg(which, index, bool) {
        const map = {
            next: this.$refs.nextImgWrapper,
            prev: this.$refs.prevImgWrapper,
            current: this.$refs.currImgWrapper
        };
        const collection = map[which];
        const el = collection ? collection[index] : null;

        if (el) {
            el.classList[bool ? 'add' : 'remove']('-scale-up-img');
        }
    }

    handleNextTriggerMouseOver() {
        if (this.isNextSlideAvailable()) {
            this.setCursorText('NEXT');
            raf(() => {
                this.$refs.body.classList.add('-cursor-next');
                this.scaleUpImg('next', this.$state.currentSlide + 1, true);
            });
        } else {
            this.$refs.body.classList.remove('-cursor-next');
            this.setCursorText('');
        }
    }

    handleNextTriggerMouseOut() {
        this.$refs.body.classList.remove('-cursor-next');
        this.setCursorText('');
        this.scaleUpImg('next', this.$state.currentSlide + 1, false);
    }

    handlePrevTriggerMouseOver() {
        if (this.isPrevSlideAvailable()) {
            this.setCursorText('PREV');
            raf(() => {
                this.$refs.body.classList.add('-cursor-prev');
                this.scaleUpImg('prev', this.$state.currentSlide - 1, true);
            });
        } else {
            this.$refs.body.classList.remove('-cursor-prev');
            this.setCursorText('');
        }
    }

    handlePrevTriggerMouseOut() {
        this.$refs.body.classList.remove('-cursor-prev');
        this.setCursorText('');
        this.scaleUpImg('prev', this.$state.currentSlide - 1, false);
    }

    handleCurrentTriggerMouseOver() {
        this.setCursorText('OPEN');
        raf(() => {
            this.$refs.body.classList.add('-cursor-open');
            this.scaleUpImg('current', this.$state.currentSlide, true);
        });
    }

    handleCurrentTriggerMouseOut() {
        this.$refs.body.classList.remove('-cursor-open');
        this.setCursorText('');
        this.scaleUpImg('current', this.$state.currentSlide, false);
    }

    isCursorModified() {
        const {
            classList
        } = this.$refs.body;
        return classList.contains('-cursor-open') || classList.contains('-cursor-prev') || classList.contains('-cursor-next');
    }

    handleCursorClick() {
        if (this.isCursorModified()) {
            clearTimeout(this.handleCursorClickTimeout);
            this.$refs.body.classList.add('-cursor-clicked');
            this.handleCursorClickTimeout = setTimeout(() => {
                raf(() => {
                    this.$refs.body.classList.remove('-cursor-clicked');
                });
            }, 300);
        }
    }

    addListenerToAll(collection, event, handler) {
        collection.forEach(el => el.addEventListener(event, handler));
    }

    addListenerToLastEl(collection, event, handler) {
        collection[collection.length - 1].addEventListener(event, handler);
    }

    setPointerEvents(collection, value) {
        if (collection.length) {
            collection.forEach(el => el.style.pointerEvents = value);
        } else {
            collection.style.pointerEvents = value;
        }
    }

    initEvents() {
        this.addListenerToLastEl(this.$refs.prevSlideTrigger, 'click', () => this.handleSlideChange('prev'));
        this.addListenerToLastEl(this.$refs.nextSlideTrigger, 'click', () => this.handleSlideChange('next'));
        this.addListenerToLastEl(this.$refs.prevSlideTrigger, 'mouseover', this.handlePrevTriggerMouseOver.bind(this));
        this.addListenerToLastEl(this.$refs.prevSlideTrigger, 'mouseout', this.handlePrevTriggerMouseOut.bind(this));
        this.addListenerToLastEl(this.$refs.nextSlideTrigger, 'mouseover', this.handleNextTriggerMouseOver.bind(this));
        this.addListenerToLastEl(this.$refs.nextSlideTrigger, 'mouseout', this.handleNextTriggerMouseOut.bind(this));
        this.addListenerToLastEl(this.$refs.currentSlideTrigger, 'mouseover', this.handleCurrentTriggerMouseOver.bind(this));
        this.addListenerToLastEl(this.$refs.currentSlideTrigger, 'mouseout', this.handleCurrentTriggerMouseOut.bind(this));
        window.addEventListener('click', this.handleCursorClick.bind(this));
    }

    initStateProxy() {
        this.$state = new Proxy(this.$state, {
            set: (obj, prop, newValue) => {
                const oldValue = obj[prop]; // The default behavior to store the value

                obj[prop] = newValue;

                if (typeof this.$watch[prop] === 'function') {
                    const hasChanged = newValue !== oldValue;

                    if (hasChanged) {
                        this.$watch[prop](newValue, oldValue);
                    }
                }

                return true;
            }
        });
    }

    onSwiperLeft(callback) {
        this.onSwiperLeft = callback;
        console.log('left');

        return this;
    }

    onSwiperRight(callback) {
        this.onSwiperRight = callback;
        console.log('right');

        return this;
    }

    handleSwiperTouchMove(evt) {
        if (!this.xDown || !this.yDown) {
            return;
        }

        let xUp = evt.touches[0].clientX;
        let yUp = evt.touches[0].clientY;

        this.xDiff = this.xDown - xUp;
        this.yDiff = this.yDown - yUp;

        if (Math.abs(this.xDiff) > Math.abs(this.yDiff)) { // Most significant.
            if (this.xDiff > 0) {
                this.onSwiperLeft();
            } else {
                this.onSwiperRight();
            }
        }

        // else {
        //     if (this.yDiff > 0) {
        //         this.onSwiperUp();
        //     } else {
        //         this.onSwiperDown();
        //     }
        // }

        // Reset values.
        this.xDown = null;
        this.yDown = null;
    }

    runSwiper() {
        this.element.addEventListener('touchmove', function (evt) {
            this.handleSwiperTouchMove(evt);
        }.bind(this), false);
    }

    init() {
        this.initStateProxy();
        this.initEvents();
        const initialIndex = 0;
        this.setMainViewIndexTo(initialIndex);
        this.setPointerEvents(this.$refs.prevSlidesWrapper, 'none');
        raf(() => {
            this.$refs.currImgWrapper[initialIndex].classList.add('-hide-top');
            this.$refs.nextImgWrapper[initialIndex].classList.add('-visibility-hidden');
            this.$refs.nextImgWrapper[initialIndex + 1].classList.add('-hide-top');
        });
        setTimeout(() => {
            raf(() => {
                this.$refs.currImgWrapper[initialIndex].classList.remove('-hide-top');
                this.$refs.nextImgWrapper[initialIndex + 1].classList.remove('-hide-top');
            });
        }, 700);
    }

} // Init Components

const swiper = new ThreeBlockSwiper();
swiper.init();