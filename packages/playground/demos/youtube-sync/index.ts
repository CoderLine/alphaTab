import { YoutubeSyncApp } from '../../src/apps/YoutubeSyncApp';

const root = document.getElementById('app');
if (!root) {
    throw new Error('#app element not found');
}
const app = new YoutubeSyncApp();
root.appendChild(app.root);
