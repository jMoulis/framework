import html from "../framework/helpers/html";
import app from "./components/App";
import taskDone from "./components/TaskDone";

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (root) {
    root.appendChild(html`<div>${app()} ${taskDone()}</div>`);
  }
});
