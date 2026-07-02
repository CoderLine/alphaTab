import { LabsIndexApp } from './src/apps/LabsIndexApp';

const root = document.getElementById('app');
if (!root) {
    throw new Error('#app element not found');
}
const app = new LabsIndexApp();
root.appendChild(app.root);
