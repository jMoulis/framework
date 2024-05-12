import html from "../../framework/helpers/html";
import { subscribeEvent, publishEvent } from "../../framework/services/EventSubscriptionService";
import { MutationEventCallbacks, onMount, onUpdate } from "../../framework/services/LifeCycleService";

export default function () {
  const handleResetItem = (listItem: HTMLElement) => {
    if (listItem) {

      publishEvent<{ taskName: string, taskId: string }>({
        type: 'TASK_RESET', payload: {
          taskName: `${listItem.getAttribute('name')}`,
          taskId: `${listItem.getAttribute('id')}`
        }
      });
      listItem.remove();
    }
  }

  const list = html`<ul id="list-done"></ul>`;

  const root = html`
    <div>
      <h1>Tasks Done</h1>
      ${list}
    </div>
  `
  onMount(list, (element) => {
    subscribeEvent<{ taskName: string, taskId: string }>(element, 'TASK_DELETE', ({ payload }) => {
      console.log(payload)
      const listItem = html`<li id="${payload.taskId}" name="${payload.taskName}"><span>${payload.taskName}</span>
      <button onClick="${() => handleResetItem(listItem)}">
        Delete
      </button></li>`;
      element.appendChild(listItem);

    });
  });
  return root;
}
