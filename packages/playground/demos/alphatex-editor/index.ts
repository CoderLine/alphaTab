import { AlphaTexEditorApp } from '../../src/apps/AlphaTexEditorApp';

const root = document.getElementById('app');
if (!root) {
    throw new Error('#app element not found');
}
const app = new AlphaTexEditorApp();
root.appendChild(app.root);
