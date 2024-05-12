import html from "../../framework/helpers/html";
import { subscribeEvent } from "../../framework/services/EventSubscriptionService";
import { onMount } from "../../framework/services/LifeCycleService";
import { ButtonColor } from "./ButtonColor";
import { ButtonCounter } from "./ButtonCounter";
import { myNewStore } from "./stores";
import { taskListItem } from "./taskListItem";
const generateListItems = () => {
  const fragment = document.createDocumentFragment();
  for (let i = 1; i <= 2; i++) {
    const listItem = taskListItem({ taskId: `task-${i}`, name: `Task ${i}` })
    fragment.appendChild(listItem);
  }
  document.querySelector("#list")?.replaceChildren(fragment);
}
const tasks = [{
  taskId: 'task-1',
  name: 'Task 1'
}, {
  taskId: 'task-2',
  name: 'Task 2'
}, {
  taskId: 'task-3',
  name: 'Task 3'
}]
const app = () => {
  const [subscribe] = myNewStore
  const element = html`
    <div>
      <h1>Generate List Items</h1>
      <div id="color" style="color: red">red</div>
      ${ButtonCounter()}
      ${ButtonColor()}
      <ul id="list">${tasks.map(taskListItem)}</ul>
    </div>
  `
  onMount(element, () => {
    const subscription = subscribeEvent<{ taskName: string, taskId: string }>(element, 'TASK_RESET', ({ payload }) => {
      const listItem = taskListItem({ taskId: payload.taskId, name: payload.taskName });
      document.querySelector("#list")?.appendChild(listItem);
    });
    const color = element.querySelector('#color') as HTMLElement;

    const cleanup = subscribe((value) => {
      if (!color) return;
      color.textContent = value;
      color.style.color = value;
    });

    return () => {
      cleanup();
      subscription.unsubscribe();
    }
  });
  return element;
}

export default app;