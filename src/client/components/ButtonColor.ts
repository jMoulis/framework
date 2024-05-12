import html from "../../framework/helpers/html"
import { BehaviorSubject } from 'rxjs';
import { onMount } from "../../framework/services/LifeCycleService";
import { useData } from "../../framework/services/StoreService";
import { myNewStore } from "./stores";

export const ButtonColor = () => {
  const [subscribeColor, updateColor] = myNewStore;

  const button = html`<button style="border: 1px solid black" onClick="${() => updateColor((prev) => {
    if (prev === 'red') return 'blue';
    return 'red';
  })}">red</button>`;

  onMount(button, () => {
    const cleanup = subscribeColor((value) => {
      button.style.border = `1px solid ${value}`;
    });
    return () => {
      cleanup();
    }
  });
  return button;
}