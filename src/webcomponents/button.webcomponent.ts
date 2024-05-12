import createWebComponent from "../client/creators/createWebComponent";

const ButtonComponent = createWebComponent({
  tagName: 'button-component',

  attributes: {
    'data-type': (oldValue: string, newValue: string) => {
      console.log('Old Value', oldValue);
      console.log('New Value', newValue);
    }
  },
  observedAttributes: ['data-type']
});

export default new ButtonComponent();