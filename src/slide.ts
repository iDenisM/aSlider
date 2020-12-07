import { 
  IOptions,
  Direction } from './utils/defaults';

export class Slide {
  element: HTMLElement;
  index: number;
  private _options: IOptions;
  private _changeTo: Direction;

  constructor(element: HTMLElement, options: IOptions) {
    this.element = element;
    this.index = 0;
    this._options = options;
    this._changeTo = Direction.Idle;
  }

  //Watch for a event and add remove class active next prev
} 