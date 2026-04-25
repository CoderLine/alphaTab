import { TestResultsApp } from '../../src/apps/TestResultsApp';

const root = document.getElementById('app');
if (!root) {
    throw new Error('#app element not found');
}
const app = new TestResultsApp();
root.appendChild(app.root);
