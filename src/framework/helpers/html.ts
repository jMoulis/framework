import { fromEvent } from "rxjs";
import * as EventSubscriptionService from "../services/EventSubscriptionService";

/**
 * Processes a value and returns a string representation.
 * If the value is an HTMLElement, it returns a placeholder div element.
 * If the value is an array, it recursively processes each element and joins them together.
 * If the value is a function, it returns a string indicating it's a function.
 * Otherwise, it returns the value as a string or an empty string if the value is falsy.
 *
 * @param value - The value to process.
 * @param index - The index or identifier for the value.
 * @returns The processed value as a string.
 */
function processValue(value: any, index: string) {
  if (value instanceof HTMLElement) {
    return `<div id="internal-placeholder-${index}"></div>`;
  };
  if (Array.isArray(value)) {
    value = value.map((innervalue, innerIndex) => processValue(innervalue, `${index}-${innerIndex}`)).join('');
  }
  return typeof value === 'function' ? `func-${index}` : `${value || ''}`;
}

/**
 * Processes an array of strings and values to generate an HTML string.
 *
 * @param strings - The array of strings to process.
 * @param values - The array of values to insert into the string.
 * @returns The generated HTML string.
 */
function processStringsToHTMLString(strings: TemplateStringsArray, values: any[]) {
  return strings.reduce((acc, str, idx) => {
    const value = values[idx - 1];
    return acc + (value !== undefined ? processValue(value, String(idx - 1)) : '') + str;
  });
}

/**
 * Replaces a placeholder element in a DocumentFragment with a value.
 * If the value is an array, it recursively replaces placeholders for each element in the array.
 * If the value is an HTMLElement, it replaces the corresponding placeholder element in the DocumentFragment.
 *
 * @param content - The DocumentFragment containing the placeholder elements.
 * @param value - The value to replace the placeholder with.
 * @param index - The index of the placeholder element.
 */
function replacePlaceholder(content: DocumentFragment, value: any, index: string) {
  if (Array.isArray(value)) {
    value.forEach((innerValue, innerIdx) => replacePlaceholder(content, innerValue, `${index}-${innerIdx}`));
  } else
    if (value instanceof HTMLElement) {
      const placeholder = content.querySelector(`#internal-placeholder-${index}`);
      if (placeholder) {
        placeholder.replaceWith(value);
      }
    }
}
/**
 * Replaces placeholders in the given content with the provided values.
 *
 * @param {DocumentFragment} content - The content containing placeholders.
 * @param {any[]} values - The values to replace the placeholders with.
 * @returns {void}
 */
function replacePlaceholders(content: DocumentFragment, values: any[]) {
  return values.forEach((value, index) => replacePlaceholder(content, value, String(index)));
}
/**
 * Creates a template element from the provided template strings and values.
 *
 * @param strings - The template strings.
 * @param values - The template values.
 * @returns The content of the created template element.
 */
function createTemplate(strings: TemplateStringsArray, ...values: any) {
  const template = document.createElement('template');
  template.innerHTML = processStringsToHTMLString(strings, values);
  return template.content
}

/**
 * Creates an HTML element from a template string and replaces placeholders with provided values.
 *
 * @param strings - The template strings.
 * @param values - The values to replace the placeholders in the template.
 * @returns The created HTML element.
 * @throws Error if the template does not contain exactly one top-level element.
 */
function html(strings: TemplateStringsArray, ...values: any) {
  const templateContent = createTemplate(strings, ...values);
  const content = document.importNode(templateContent, true);

  replacePlaceholders(content, values);

  const handleEvent = (element: Element, attr: Attr) => {
    const eventType = attr.name.substring(2).toLowerCase();
    const match = attr.value.match(/\d+/)?.[0];
    if (!match) return;
    const handlerIndex = parseInt(match, 10);
    const handler = values[handlerIndex];

    if (handler && typeof handler === 'function') {
      const subscription = fromEvent(element, eventType).subscribe(handler);
      EventSubscriptionService.register(element, subscription);
      element.removeAttribute(attr.name);
    }
  };

  content.querySelectorAll('*').forEach(element => {
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        handleEvent(element, attr);
        element.removeAttribute(attr.name);
      }
    });
  });

  // Ensure the content has exactly one top-level element
  if (content.children.length !== 1) {
    throw new Error('Template must contain exactly one top-level element');
  }
  return content.firstElementChild as HTMLElement;
}


/**
 * Represents a helper function for generating HTML content.
 * @returns {string} The generated HTML content.
 */
export default html;