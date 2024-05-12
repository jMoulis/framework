import BaseComponent from "../components/BaseComponent"

interface ICreateWebcomponentConfig {
  tagName: string;
  connected?: () => void
  disconnected?: () => void
  attributes?: Record<string, any>
  observedAttributes?: string[]
  onError?: (error: string) => void
}

export default function createWebComponent(config: ICreateWebcomponentConfig) {
  const {
    tagName,
    connected,
    disconnected,
    attributes,
    observedAttributes = [],
    onError,
  } = config;


  class GeneratedComponent extends BaseComponent {
    props: any;

    constructor() {
      super();

    }
    connectedCallback() {

      if (connected) {
        connected.call(this);
      }
    }
    disconnectedCallback() {
      // Call disconnected lifecycle hook if provided
      if (disconnected) {
        disconnected.call(this);
      }
      super.disconnectedCallback();
    }
    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
      // Handle attribute changes based on config
      if (attributes && attributes[name]) {
        attributes[name].call(this, oldValue, newValue);
      }
    }
    static get observedAttributes() {
      return observedAttributes;
    }
    getElement() {
      return this;
    }
  }
  // Register the component with its tag name
  if (customElements.get(tagName)) {
    const errorMessage = `A custom element with the tag name '${tagName}' is already defined.`;
    if (onError) {
      onError(errorMessage);
    } else {
      console.error(errorMessage);
    }
  } else {
    try {
      customElements.define(tagName, GeneratedComponent);
    } catch (error: any) {
      if (onError) {
        onError(`Failed to define the element '${tagName}': ${error.message}`);
      } else {
        console.error(`Failed to define the element '${tagName}': ${error.message}`);
      }
    }
  }

  return GeneratedComponent;
}