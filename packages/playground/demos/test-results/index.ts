import { TestResultsApp } from '../../src/apps/TestResultsApp';

const root = document.getElementById('app');
if (!root) {
    throw new Error('#app element not found');
}
const app = new TestResultsApp();
root.appendChild(app.root);

if (import.meta.hot) {
    import.meta.hot.accept();
    import.meta.hot.dispose(() => {
        app.dispose();
    });
}
