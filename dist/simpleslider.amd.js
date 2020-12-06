define(['exports'], function (exports) { 'use strict';

  var Classes = {
    next: 'next',
    prev: 'prev',
    wrapper: 'slides',
    prevBtn: 'control_prev',
    nextBtn: 'control_next',
    navBtn: 'nav_elem',
    slides: {
      slide: 'slide',
      active: 'slide_active',
      prev: 'slide_prev',
      next: 'slide_next'
    }
  };

  var Options = {
    wrapperSelector: '.'.concat(Classes.wrapper),
    controls: {
      prevBtnSelector: '.'.concat(Classes.prevBtn),
      nextBtnSelector: '.'.concat(Classes.nextBtn)
    },
    navigation: '.'.concat(Classes.navBtn),
    slides: {
      slideSelector: '.'.concat(Classes.slides.slide),
      activeSlideSelector: '.'.concat(Classes.slides.active),
      prevSlideSelector: '.'.concat(Classes.slides.prev),
      nextSlideSelector: '.'.concat(Classes.slides.next)
    }
  };
  /**
   * @description Direction where to move the slider
   */

  var Direction;

  (function (Direction) {
    Direction[Direction["Idle"] = 0] = "Idle";
    Direction[Direction["Prev"] = 1] = "Prev";
    Direction[Direction["Next"] = 2] = "Next";
  })(Direction || (Direction = {}));

  var SlideState;

  (function (SlideState) {
    SlideState[SlideState["Idle"] = 0] = "Idle";
    SlideState[SlideState["Active"] = 1] = "Active";
    SlideState[SlideState["Next"] = 2] = "Next";
    SlideState[SlideState["Prev"] = 3] = "Prev";
  })(SlideState || (SlideState = {}));

  // in worker

  /**
   * @description Create the actors that are used to get the index of acting sliders
   */

  var Actors =
  /** @class */
  function () {
    function Actors(props, lastSlideIndex) {
      this.active = [];
      this.prev = [];
      this.next = [];
      this.active = props.active;
      this.prev = props.prev;
      this.next = props.next;
      this.lastIndex = lastSlideIndex;
    }
    /**
     * @description increase by one the values in an array up to the last index if it is bigger then the last index then it becomes zero
     * @param indexes array of numbers
     */


    Actors.prototype._increaseValue = function (indexes) {
      var _this = this;

      return indexes.map(function (i) {
        return i != _this.lastIndex ? ++i : 0;
      });
    };
    /**
     * @description decrease by on the values in an array up to zero if it is lower then zero then it becomes last index
     * @param indexes array of numbers
     */


    Actors.prototype._decreaseValue = function (indexes) {
      var _this = this;

      return indexes.map(function (i) {
        return i ? --i : _this.lastIndex;
      });
    };
    /**
     * @description shift all the values accordingly to the new index
     * @param newIndex target where to jump
     * @param indexes array of number
     */


    Actors.prototype._jumpToValue = function (newIndex, indexes) {
      var _this = this;

      return indexes.map(function (i) {
        return i + newIndex > _this.lastIndex ? i + newIndex - _this.lastIndex - 1 : i + newIndex;
      });
    };

    Object.defineProperty(Actors.prototype, "change", {
      /**
       * @description update the index of slides accordingly to direction to move
       * @param direction direction to go
       * @param lastSlide slider last slide
       */
      set: function (direction) {
        switch (direction) {
          case Direction.Next:
            this.active = this._increaseValue(this.active);
            this.next = this._increaseValue(this.next);
            this.prev = this._increaseValue(this.prev);
            break;

          case Direction.Prev:
            this.active = this._decreaseValue(this.active);
            this.next = this._decreaseValue(this.next);
            this.prev = this._decreaseValue(this.prev);
            break;
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Actors.prototype, "changeTo", {
      /**
       * @description change all the actors to a certain value starting from the @index in active
       * @param index root index to change all other
       */
      set: function (index) {
        this.active = this._jumpToValue(index, this.active);
        this.next = this._jumpToValue(index, this.next);
        this.prev = this._jumpToValue(index, this.prev);
      },
      enumerable: false,
      configurable: true
    });
    return Actors;
  }();

  var classAdd = function (elem, className) {
    if (elem) elem.classList.add(className);
  };
  var classRemove = function (elem, className) {
    if (elem) elem.classList.remove(className);
  };

  var SliderWrapper =
  /** @class */
  function () {
    function SliderWrapper(wrapperElement, options) {
      this._elem = wrapperElement;

      var slides = this._slides = this._elem.querySelectorAll(options.slides.slideSelector);

      var slidesIndex = {
        active: [0],
        next: [1],
        prev: [slides.length - 1]
      };
      this._direction = Direction.Idle;
      this._jumpTo = 0;
      this._actors = new Actors(slidesIndex, slides.length - 1);
      this._animating = false;
      this._isJumping = false;
      this._slideList = this._createSlideList(slidesIndex);

      this._updateAllSlidesClasses();

      if (slides.length) {
        this._eventsHandler();
      }
    }

    SliderWrapper.prototype._createSlideList = function (slidesIndex) {
      var _this = this;

      return {
        active: slidesIndex.active.map(function (s) {
          return _this._slides[s];
        }),
        prev: slidesIndex.prev.map(function (s) {
          return _this._slides[s];
        }),
        next: slidesIndex.next.map(function (s) {
          return _this._slides[s];
        })
      };
    };

    SliderWrapper.prototype._eventsHandler = function () {
      this._elem.addEventListener('transitionend', this._animationEnd.bind(this), false);
    };

    Object.defineProperty(SliderWrapper.prototype, "movedTo", {
      /**
       * @description Get the slider moved direction
       */
      get: function () {
        return this._direction;
      },

      /**
       * @description Sets where the slider moved to
       */
      set: function (direction) {
        if (!this._animating) {
          this._animating = true;
          this._direction = direction;
          if (direction === Direction.Prev && this._slides.length === 2) this._updateSlidesClasses(this._slideList.next, Classes.slides.prev);
          classAdd(this._elem, direction === Direction.Prev ? Classes.prev : Classes.next);
        }
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(SliderWrapper.prototype, "jumpTo", {
      get: function () {
        return this._jumpTo;
      },

      /**
       * @description Set the slide to jump towards
       */
      set: function (index) {
        var activeActors = this._actors.active;

        if (activeActors.indexOf(index) === -1) {
          this._isJumping = true;
          this._jumpTo = index;
          var direction = activeActors[activeActors.length - 1] > index ? Direction.Prev : Direction.Next;
          var slidesToArange = direction === Direction.Prev ? this._actors.prev : this._actors.next;

          for (var i = slidesToArange[slidesToArange.length - 1] + 1; i <= index; i++) {
            slidesToArange.push(i);
          }

          for (var i = 0; i < slidesToArange.length; i++) {
            this._slides[slidesToArange[i]].style.transform = "translate3d(" + (direction === Direction.Prev ? '-' : '') + (i + 1) * 100 + "%, 0, 0)";
          }

          var multiplier = direction === Direction.Prev ? this._actors.active[0] - index : index - this._actors.active[0];
          this._elem.style.transform = "translate3d(" + (direction === Direction.Prev ? '' : '-') + 100 * multiplier + "%, 0, 0)";
        }
      },
      enumerable: false,
      configurable: true
    });

    SliderWrapper.prototype._animationEnd = function () {
      if (this._isJumping) {
        this._actors.change = this.movedTo;
      } else {
        this._actors.changeTo = this.jumpTo;
      }

      this._updateAllSlidesClasses();

      classRemove(this._elem, this.movedTo === Direction.Prev ? Classes.prev : Classes.next);
      this._isJumping = false;
      this._animating = false;
    };

    SliderWrapper.prototype._updateAllSlidesClasses = function () {
      var slideList = this._slideList;

      var tempSlideList = this._createSlideList(this._actors);

      var tempSlideListArr = tempSlideList.active.concat(tempSlideList.next, tempSlideList.prev);
      var idleList = slideList.active.concat(slideList.next, slideList.prev).filter(function (s) {
        return tempSlideListArr.indexOf(s) === -1;
      });
      this._slideList = tempSlideList;

      this._updateSlidesClasses(idleList);

      this._updateSlidesClasses(tempSlideList.active, Classes.slides.active);

      if (this._isJumping) {
        for (var i = 0; i < this._slides.length; i++) {
          this._slides[i].style.removeProperty('transform');
        }
      }

      this._updateSlidesClasses(tempSlideList.next, Classes.slides.next);

      if (this._slides.length > 2) this._updateSlidesClasses(tempSlideList.prev, Classes.slides.prev);
    };
    /**
     * @description Graphicaly move the slide in idle/active/next/prev position
     */


    SliderWrapper.prototype._updateSlidesClasses = function (slides, className) {
      if (className === void 0) {
        className = '';
      } // for (const slide of slides) {


      for (var i = 0; i < slides.length; i++) {
        classRemove(slides[i], Classes.slides.active);
        classRemove(slides[i], Classes.slides.next);
        classRemove(slides[i], Classes.slides.prev);
        if (className) classAdd(slides[i], className);
      }
    };

    return SliderWrapper;
  }();

  var Slider =
  /** @class */
  function () {
    function Slider(selector, options) {
      this.element = typeof selector === 'string' ? document.querySelector(selector) : selector;
      this.options = options != null ? Object.assign(Options, options) : Options;
      var wrapperElement = this.element.querySelector(this.options.wrapperSelector);
      var wrapper = new SliderWrapper(wrapperElement, this.options);

      this._handleEvents(wrapper);
    }

    Slider.prototype._handleEvents = function (wrapper) {
      var prevButton = this.element.querySelector(this.options.controls.prevBtnSelector);
      var nextButton = this.element.querySelector(this.options.controls.nextBtnSelector);
      var navigationButtonsList = this.element.querySelectorAll(this.options.navigation);
      if (nextButton) nextButton.addEventListener('click', function () {
        return wrapper.movedTo = Direction.Next;
      }, false);
      if (prevButton) prevButton.addEventListener('click', function () {
        return wrapper.movedTo = Direction.Prev;
      }, false);

      var _loop_1 = function (i) {
        navigationButtonsList[i].addEventListener('click', function () {
          return wrapper.jumpTo = i;
        }, false);
      };

      for (var i = 0; i < navigationButtonsList.length; i++) {
        _loop_1(i);
      }
    };

    return Slider;
  }();

  exports.Slider = Slider;

  Object.defineProperty(exports, '__esModule', { value: true });

});
