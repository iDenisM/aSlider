import { Classes } from './utils/constants';
import { 
  IOptions,
  ICurrentActors,
  ISlide, 
  Direction } from './utils/defaults';
import { Actors } from './actors';
import { classAdd , classRemove } from './utils/shortcuts';

export class SliderWrapper {
  private _elememnt: HTMLElement;
  private _slides: NodeListOf<HTMLElement>;
  private _actors: Actors;
  private _slideList: ISlide;
  private _animating: boolean;
  private _direction: Direction;
  private _jumpTo: number;
  private _isJumping: boolean;

  constructor(element: HTMLElement, options: IOptions) {
    this._elememnt = element;
    let slides = this._slides = this._elememnt.querySelectorAll(options.slides.slideSelector);
    const slidesIndex = {
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

  private _createSlideList(slidesIndex: ICurrentActors): ISlide {
    return {
      active: slidesIndex.active.map(s => this._slides[s]),
      prev: slidesIndex.prev.map(s => this._slides[s]),
      next: slidesIndex.next.map(s => this._slides[s])
    }
  }

  private _eventsHandler() {
    this._elememnt.addEventListener('transitionend', this._animationEnd.bind(this), false);
  }

  /**
   * @description Get the slider moved direction
   */
  get movedTo() {
    return this._direction;
  }

  /**
   * @description Sets where the slider moved to
   */
  set movedTo(direction: Direction) {
    if (!this._animating) {
      this._animating = true;
      this._direction = direction;
      if (direction === Direction.Prev && this._slides.length === 2)
        this._updateSlidesClasses(this._slideList.next, Classes.slides.prev);
      classAdd(this._elememnt, direction === Direction.Prev ? Classes.prev : Classes.next);
    }
  }

  get jumpTo() {
    return this._jumpTo;
  }
  
  /**
   * @description Set the slide to jump towards
   */
  set jumpTo(index: number) {
    let activeActors = this._actors.active;
    if (activeActors.indexOf(index) === -1) {
      this._isJumping = true;
      this._jumpTo = index;
      let direction = activeActors[activeActors.length - 1] > index ? Direction.Prev : Direction.Next;
      let slidesToArange = direction === Direction.Prev ? this._actors.prev : this._actors.next;
      for (let i = slidesToArange[slidesToArange.length - 1] + 1; i <= index; i++) {
        slidesToArange.push(i);
      }
      for (let i = 0; i < slidesToArange.length; i++) {
        this._slides[slidesToArange[i]].style.transform = `translate3d(${direction === Direction.Prev ? '-' : ''}${(i + 1) * 100}%, 0, 0)`;
      }
      classAdd(this._elememnt, Classes.jumping);
      let multiplier = direction === Direction.Prev ? this._actors.active[0] - index : index - this._actors.active[0];
      this._elememnt.style.transform = `translate3d(${direction === Direction.Prev ? '' : '-'}${100 * multiplier}%, 0, 0)`;
    }
  }

  private _animationEnd() {
    if (this._isJumping) {
      this._actors.changeTo = this.jumpTo;
    } else {
      this._actors.change = this.movedTo;
    }
    this._updateAllSlidesClasses();
    classRemove(this._elememnt, this.movedTo === Direction.Prev ? Classes.prev : Classes.next);
    this._isJumping = false;
    this._animating = false;
  }

  private _updateAllSlidesClasses() {
    let slideList = this._slideList;
    let tempSlideList = this._createSlideList(this._actors);
    let tempSlideListArr = tempSlideList.active.concat(tempSlideList.next, tempSlideList.prev);
    let idleList = slideList.active.concat(slideList.next, slideList.prev).filter(s => tempSlideListArr.indexOf(s) === -1);

    this._slideList = tempSlideList;

    this._updateSlidesClasses(idleList);
    this._updateSlidesClasses(tempSlideList.active, Classes.slides.active);
    if (this._isJumping) {
      for (let i = 0; i < this._slides.length; i++) {
        this._slides[i].style.removeProperty('transform');
      }
      classRemove(this._elememnt, Classes.jumping);
      this._elememnt.style.removeProperty('transform');
    }
    this._updateSlidesClasses(tempSlideList.next, Classes.slides.next);
    if (this._slides.length > 2)
      this._updateSlidesClasses(tempSlideList.prev, Classes.slides.prev);
  }

  /**
   * @description Graphicaly move the slide in idle/active/next/prev position
   */
  private _updateSlidesClasses(slides: HTMLElement[], className: string = '') {
    // for (const slide of slides) {
    for (let i = 0; i < slides.length; i++) {
      classRemove(slides[i], Classes.slides.active);
      classRemove(slides[i], Classes.slides.next);
      classRemove(slides[i], Classes.slides.prev);
      if (className)
        classAdd(slides[i], className);
    }
  }
}
