import { Classes } from "./utils/constants";
import { 
  IOptions,
  ICurrentActors,
  ISlide, 
  Direction } from "./utils/defaults";
import { Actors } from './actors';
import { classAdd , classRemove } from "./utils/shortcuts";

export class SliderWrapper {
  private _elem: HTMLElement;
  private _slides: NodeListOf<HTMLElement>;
  private _actors: Actors;
  private _slideList: ISlide;
  private _animating: boolean;
  private _direction: Direction;
  private _jumpTo: number;

  constructor(wrapperElement: HTMLElement, options: IOptions) {
    this._elem = wrapperElement;
    let slides = this._slides = this._elem.querySelectorAll(options.slides.slideSelector);
    const slidesIndex = {
      active: [0],
      next: [1],
      prev: [slides.length - 1]
    };
    this._direction = Direction.Idle;
    this._jumpTo = 0;
    this._actors = new Actors(slidesIndex, slides.length - 1);
    this._animating = false;
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
    this._elem.addEventListener('transitionend', this._animationEnd.bind(this), false);
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
      classAdd(this._elem, direction === Direction.Prev ? Classes.prev : Classes.next);
    }
  }

  get jumpTo() {
    return this._jumpTo;
  }
  
  /**
   * @description Jumps to a slide
   */
  set jumpTo(index: number) {
    let activeActors = this._actors.active;
    if (activeActors.indexOf(index) === -1) {
      this._jumpTo = index;
      let direction = activeActors[activeActors.length - 1] > index ? Direction.Prev : Direction.Next;
      let slidesToArange = direction === Direction.Prev ? this._actors.prev : this._actors.next;
      for (let i = slidesToArange[slidesToArange.length - 1] + 1; i <= index; i++) {
        slidesToArange.push(i);
      }
      for (let i = 0; i < slidesToArange.length; i++) {
        this._slides[slidesToArange[i]].style.transform = `translate3d(${direction === Direction.Prev ? '-' : ''}${(i + 1) * 100}%, 0, 0)`;
      }
      // Trigger the animation to slide of index
    }
  }

  private _animationEnd() {
    this._actors.change = this.movedTo;
    this._updateAllSlidesClasses();
    classRemove(this._elem, this.movedTo === Direction.Prev ? Classes.prev : Classes.next);
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
