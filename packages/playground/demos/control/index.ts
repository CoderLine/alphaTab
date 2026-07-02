import { ControlApp } from '../../src/apps/ControlApp';

const root = document.getElementById('app');
if (!root) {
    throw new Error('#app element not found');
}
const app = new ControlApp();
root.appendChild(app.root);
