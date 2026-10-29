import { PlayerPositionRateApp } from '../../src/apps/PlayerPositionRateApp';

const root = document.getElementById('app');
if (!root) {
    throw new Error('#app element not found');
}
const app = new PlayerPositionRateApp();
root.appendChild(app.root);
