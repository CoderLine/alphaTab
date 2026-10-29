// lucide only types its barrel; per-icon modules are imported directly so Vite does not pre-bundle all ~3.7k icons.
declare module 'lucide/dist/esm/icons/*.mjs' {
    const icon: import('lucide').IconNode;
    export default icon;
}

declare module 'lucide/dist/esm/createElement.mjs' {
    const createElement: typeof import('lucide').createElement;
    export default createElement;
}
