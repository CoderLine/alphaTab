import { RecorderApp } from '../../src/apps/RecorderApp';

const root = document.getElementById('app');
if (!root) {
    throw new Error('#app element not found');
}
const app = new RecorderApp();
root.appendChild(app.root);
