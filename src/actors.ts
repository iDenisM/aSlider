import { 
  Direction,
  ICurrentActors } from "./utils/defaults";

// TODO: Evaluate if need to move this class
// in worker
/**
 * @description Create the actors that are used to get the index of acting sliders
 */
export class Actors {
  public active: number[] = [];
  public prev: number[] = [];
  public next: number[] = [];
  public lastIndex: number;

  constructor(props: ICurrentActors, lastSlideIndex: number) {
    this.active = props.active;
    this.prev = props.prev;
    this.next = props.next;
    this.lastIndex = lastSlideIndex;
  }

  /**
   * @description increase by one the values in an array up to the last index if it is bigger then the last index then it becomes zero
   * @param indexes array of numbers
   */
  _increaseValue(indexes: number[]) {
    return indexes.map(i => i != this.lastIndex ? ++i : 0);
  }

  /**
   * @description decrease by on the values in an array up to zero if it is lower then zero then it becomes last index
   * @param indexes array of numbers
   */
  _decreaseValue(indexes: number[]) {
    return indexes.map(i => i ? --i : this.lastIndex);
  }

  /**
   * @description shift all the values accordingly to the new index
   * @param newIndex target where to jump
   * @param indexes array of number
   */
  _jumpToValue(newIndex: number, indexes: number[]) {
    return indexes.map(i => i + newIndex > this.lastIndex ? i + newIndex - this.lastIndex - 1 : i + newIndex);
  }

  /**
   * @description update the index of slides accordingly to direction to move
   * @param direction direction to go
   * @param lastSlide slider last slide
   */
  set change(direction: Direction) {
    switch (direction) {
      case Direction.Next:
        this.active = this._increaseValue(this.active);
        this.next = this._increaseValue(this.next);
        this.prev = this._increaseValue(this.next);
        break;
      case Direction.Prev:
        this.active = this._decreaseValue(this.active);
        this.next = this._decreaseValue(this.next);
        this.prev = this._decreaseValue(this.next);
        break;
      default:
        break;
    }
  }

  /**
   * @description change all the actors to a certain value starting from the @index in active
   * @param index root index to change all other
   */
  set changeTo(index: number) {
    this.active = this._jumpToValue(index, this.active);
    this.next = this._jumpToValue(index, this.next);
    this.prev = this._jumpToValue(index, this.prev);
  }
}