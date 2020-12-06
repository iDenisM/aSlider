import { Slider } from '../src/index';
import { SliderWrapper } from '../src/sliderWrapper';

jest.mock('../src/sliderWrapper');

document.body.innerHTML = /*html*/`
  <div class="slider slider-4">
    <div class="slider_wrapper">
      <ul class="slides">
        <li class="slide slide_active">SLIDE 1</li>
        <li class="slide slide_next" aria-hidden="true">SLIDE 2</li>
        <li class="slide" aria-hidden="true">SLIDE 3</li>
        <li class="slide slide_prev" aria-hidden="true">SLIDE 4</li>
      </ul>
    </div>
    <ul class="controls">
      <li class="controls_elem">
        <button class="control control_prev">
        </button>
      </li>
      <li class="controls_elem">
        <button class="control control_next">
        </button>
      </li>
    </ul>
    <ul class="nav">
      <li class="nav_elem">
        <button></button>
      </li>
      <li class="nav_elem">
        <button></button>
      </li>
      <li class="nav_elem">
        <button></button>
      </li>
      <li class="nav_elem">
        <button></button>
      </li>
    </ul>
  </div>
`

it('Should throw and error if the element is not an istanceof Element', () => {
  const element = document.querySelector('.slider1') as HTMLElement;

  expect(() => {
    const slider = new Slider(element)
  }).toThrowError(new Error('Wrong element has been passed'));
})

it('Should add data-aslider="initialized" attribute if the slider has been initialized correctly', () => {
  const element = document.querySelector('.slider') as HTMLElement;
  const slider = new Slider(element);

  expect(element.hasAttribute('data-aslider')).toBe(true);
  expect(element.dataset.aslider).toBe('initialized');
})

it('Should init the slider wrapper class once', () => {
  const element = document.querySelector('.slider') as HTMLElement;
  const slider = new Slider(element);

  expect(SliderWrapper).toHaveBeenCalledTimes(1);
})

it('Should have the element property assigned correctly', () => {
  const element = document.querySelector('.slider') as HTMLElement;
  const slider = new Slider(element);

  expect(slider.element).toBe(element);
})

