// Vite ?worker imports are passed through to esbuild as a separate entry. Importing
// `@coderline/alphatab-monaco/worker` directly here breaks symbol resolution; importing it
// indirectly through this nested module gives Vite a TS source it transpiles correctly.
import './alphatexLanguageServer';
