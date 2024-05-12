import html from "../../framework/helpers/html";
import { subscribeEvent, publishEvent } from "../../framework/services/EventSubscriptionService";
import { onMount } from "../../framework/services/LifeCycleService";

const taskName = ({ name, taskId }: { name: string, taskId: string }) => {
  const element = html`
    <div>
      <p>${name}</p>
      <p>TaskID:${taskId}</p>
    <div>`;
  onMount(element, () => {

    const subscription = subscribeEvent<{ taskId: string, checked: boolean }>(element, 'TASK_CHANGE', (event) => {
      if (event.payload.taskId === taskId) {
        element.style.textDecoration = event.payload.checked ? 'line-through' : 'none';
      }
    });
    return () => {
      subscription.unsubscribe();
    }
  });
  return element;
}

export const taskListItem = ({ taskId, name }: { taskId: string, name: string }) => {
  const handleDeleteItem = (elementId: string) => {
    const listItem = document.getElementById(elementId);
    console.log(listItem?.getAttribute('name'))
    console.log(listItem?.getAttribute('id'))
    if (listItem) {
      publishEvent<{ taskName: string, taskId: string }>({
        type: 'TASK_DELETE', payload: {
          taskName: `${listItem.getAttribute('name')}`,
          taskId: `${listItem.getAttribute('id')}`
        }
      });
      listItem.remove();
    }
  }

  const handleChangeAttribute = (elementId: string) => {
    const listItem = document.getElementById(elementId);
    listItem?.setAttribute('data-changed', 'true');
  }
  const handleChangeStatus = (event: KeyboardEvent, taskId: string) => {
    const { checked } = event.target as HTMLInputElement;
    publishEvent<{ checked: boolean, taskId: string }>({ type: 'TASK_CHANGE', payload: { checked, taskId } });
  }
  const inputElement = html`<input type="checkbox" onInput="${(event: KeyboardEvent) => handleChangeStatus(event, taskId)}" />`;

  const listItem = html`
    <li name="${name}" id="${taskId}">
      ${taskName({ name, taskId })}
      ${inputElement}
      <button onClick="${() => handleDeleteItem(taskId)}">
        Delete
      </button>
      <button  onClick="${() => handleChangeAttribute(taskId)}">
        Change attribute
      </button>
    </li>
  `;

  onMount(listItem, () => {
    const subscription = subscribeEvent<{ taskId: string, checked: boolean }>(listItem, 'TASK_CHANGE', (event) => {
      if (event.payload.taskId === taskId) {
        listItem.style.backgroundColor = event.payload.checked ? 'gray' : 'white';
      }
    });
    return () => {
      subscription.unsubscribe();
    }
  });
  return listItem;

}