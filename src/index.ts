import { Options, IOptions } from './utils/defaults';
import { SliderWrapper } from './sliderWrapper';
import { Direction } from './utils/defaults';

export class Slider {
  element: HTMLElement;
  options: IOptions;
  wrapper: SliderWrapper;

  constructor(element: HTMLElement, options?: IOptions | null) {
    if (!(element instanceof Element)) {
      throw new Error('Wrong element has been passed');
    }
    this.element = element;
    this.options = { ...Options, ...options };
    const wrapperElement = this.element.querySelector(this.options.wrapperSelector) as HTMLElement;
    this.wrapper = new SliderWrapper(wrapperElement, this.options);
    this._handleEvents();
    this.element.dataset.aslider = 'initialized';
  }
  
  _handleEvents() {
    const prevButton = this.element.querySelector(this.options.controls.prevBtnSelector) as HTMLElement;
    const nextButton = this.element.querySelector(this.options.controls.nextBtnSelector) as HTMLElement;
    const navigationButtonsList = this.element.querySelectorAll(this.options.navigation) as NodeListOf<HTMLElement>;

    if (nextButton) nextButton.addEventListener('click', () => this.wrapper.movedTo = Direction.Next, false);
    if (prevButton) prevButton.addEventListener('click', () => this.wrapper.movedTo = Direction.Prev, false);

    for (let i = 0; i < navigationButtonsList.length; i++) {
      navigationButtonsList[i].addEventListener('click', () => this.wrapper.jumpTo = i, false);
    }
  }
}