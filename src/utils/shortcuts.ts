export const classAdd = (elem: Element, className: string) => {
  if (elem) elem.classList.add(className);
}

export const classRemove = (elem: Element, className: string) => {
  if (elem) elem.classList.remove(className);
}