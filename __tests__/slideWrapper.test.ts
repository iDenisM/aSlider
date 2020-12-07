import { Slider } from '../src/index';
import { Slide } from '../src/slide';
import { IOptions } from '../src/utils/defaults'

jest.mock('../src/slide');

it('Should assign the wrapper element from the default options selector', () => {
  document.body.innerHTML = /*html*/`
    <div class="slider">
      <div class="slider_wrapper">
        <ul class="slides">
          <li class="slide"></li>
        </ul>
      </div>
    </div>
  `
  const element = document.querySelector('.slider') as HTMLElement;
  const slider = new Slider(element);

  expect(slider.wrapper.elememnt).toBe(document.querySelector('.slides'));
})

it('Should assign the wrapper element from the custom options selector', () => {
  document.body.innerHTML = /*html*/`
    <div class="slider">
      <div class="slider_wrapper">
        <ul class="slides1">
          <li class="slide"></li>
        </ul>
      </div>
    </div>
  `
  const element = document.querySelector('.slider') as HTMLElement;
  const slider = new Slider(element, {wrapperSelector: '.slides1'} as IOptions);

  expect(slider.wrapper.elememnt).toBe(document.querySelector('.slides1'));
})

it('Should init all the slide as a class', () => {
  document.body.innerHTML = /*html*/`
    <div class="slider slider-4">
      <div class="slider_wrapper">
        <ul class="slides">
          <li class="slide"></li>
          <li class="slide"></li>
          <li class="slide"></li>
        </ul>
      </div>
    </div>
  `
  const element = document.querySelector('.slider') as HTMLElement;
  const slider = new Slider(element);

  expect(Slide).toHaveBeenCalledTimes(3);
})