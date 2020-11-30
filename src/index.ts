import { Options, IOptions } from "./utils/defaults";
import { SliderWrapper } from "./sliderWrapper";
import { Direction } from './utils/defaults';

export class Slider {
  element: HTMLElement;
  options: IOptions;

  constructor(selector: string | HTMLElement, options?: IOptions) {
    this.element = typeof selector === 'string' ? document.querySelector(selector) as HTMLElement : selector;
    this.options = options != null ? Object.assign(Options, options) : Options;
    const wrapperElement = this.element.querySelector(this.options.wrapperSelector) as HTMLUListElement;
    const wrapper = new SliderWrapper(wrapperElement, this.options);
    this._handleEvents(wrapper);
  }
  
  _handleEvents(wrapper: SliderWrapper) {
    const prevButton = this.element.querySelector(this.options.controls.prevBtnSelector) as HTMLElement;
    const nextButton = this.element.querySelector(this.options.controls.nextBtnSelector) as HTMLElement;
    const navigationButtonsList = this.element.querySelectorAll(this.options.navigation) as NodeListOf<HTMLElement>;

    if (nextButton) nextButton.addEventListener('click', () => wrapper.movedTo = Direction.Next, false);
    if (prevButton) prevButton.addEventListener('click', () => wrapper.movedTo = Direction.Prev, false);

    for (let i = 0; i < navigationButtonsList.length; i++) {
      navigationButtonsList[i].addEventListener('click', () => wrapper.jumpTo = i, false);
    }
  }
}