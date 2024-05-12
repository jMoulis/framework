import { fromEvent } from "rxjs";

export default class BaseComponent extends HTMLElement {


  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = '<slot></slot>';
    }
  }
  // handleSubscriptions(subscriptions: Map<Element, { eventType: string, handler: (event: Event) => void }>) {
  //   subscriptions.forEach(({ eventType, handler }, element) => {
  //     const subscription = fromEvent(element, eventType).subscribe(handler);
  //     this.subscriptionManager.add(`${eventType}-${handler.name}`, subscription);
  //   });
  // }


}