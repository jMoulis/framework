import html from "../../framework/helpers/html";
import { subscribeEvent } from "../../framework/services/EventSubscriptionService";
import { onMount } from "../../framework/services/LifeCycleService";
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
}, {
  taskId: 'task-4',
  name: 'Task 4'
}, {
  taskId: 'task-5',
  name: 'Task 5'
}, {
  taskId: 'task-6',
  name: 'Task 6'
}, {
  taskId: 'task-7',
  name: 'Task 7'
}, {
  taskId: 'task-8',
  name: 'Task 8'
}, {
  taskId: 'task-9',
  name: 'Task 9'
}, {
  taskId: 'task-10',
  name: 'Task 10'
}]
const app = () => {
  const element = html`
    <div>
      <h1>Generate List Items</h1>
      <ul id="list">${tasks.map(taskListItem)}</ul>
    </div>
  `
  onMount(element, () => {
    const subscription = subscribeEvent<{ taskName: string, taskId: string }>(element, 'TASK_RESET', ({ payload }) => {
      const listItem = taskListItem({ taskId: payload.taskId, name: payload.taskName });
      document.querySelector("#list")?.appendChild(listItem);
    });
    return () => {
      subscription.unsubscribe();
    }
  });
  return element;
}

export default app;