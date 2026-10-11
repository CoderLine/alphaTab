/** Undo/redo history over immutable values. */
export interface History<T> {
    past: T[];
    present: T;
    future: T[];
}

export type HistoryAction<T> =
    /** A user edit: becomes undoable. */
    | { type: 'commit'; value: T }
    /** A new baseline (e.g. a different score): clears the history. */
    | { type: 'reset'; value: T }
    | { type: 'undo' }
    | { type: 'redo' };

const LIMIT = 200;

export function createHistory<T>(value: T): History<T> {
    return { past: [], present: value, future: [] };
}

export function historyReducer<T>(state: History<T>, action: HistoryAction<T>): History<T> {
    switch (action.type) {
        case 'commit':
            if (action.value === state.present) return state;
            return { past: [...state.past, state.present].slice(-LIMIT), present: action.value, future: [] };
        case 'reset':
            return createHistory(action.value);
        case 'undo':
            if (state.past.length === 0) return state;
            return {
                past: state.past.slice(0, -1),
                present: state.past[state.past.length - 1],
                future: [state.present, ...state.future],
            };
        case 'redo':
            if (state.future.length === 0) return state;
            return { past: [...state.past, state.present], present: state.future[0], future: state.future.slice(1) };
    }
}
