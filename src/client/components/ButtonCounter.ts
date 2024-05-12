import html from "../../framework/helpers/html"
import { BehaviorSubject } from 'rxjs';
import { onMount } from "../../framework/services/LifeCycleService";
import { useData } from "../../framework/services/StoreService";
import { myNewStore } from "./stores";

export const ButtonCounter = () => {
  const [subscribeCounter, updateCounter] = useData<number>(0);
  const [subscribeColor] = myNewStore;

  const button = html`<button onClick="${() => updateCounter(prev => prev + 1)}">Count: 0</button>`;

  onMount(button, () => {
    const cleanup = subscribeCounter((value) => {
      button.textContent = `Count: ${value}`;
    });
    const cleanupColor = subscribeColor((value) => {
      button.style.color = value;
    });
    return () => {
      cleanup();
      cleanupColor();
    }
  });
  return button;
}