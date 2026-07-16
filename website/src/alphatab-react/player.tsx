import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { useAlphaTabModule } from './module';
import { applyAlphaTabSettings } from './settings';
import { AlphaTabStore, initialAlphaTabState, type AlphaTabState } from './store';

interface AlphaTabContextValue {
    state: AlphaTabState;
    store: AlphaTabStore | null;
    setMountElement: (node: HTMLDivElement | null) => void;
    setScrollElement: (node: HTMLDivElement | null) => void;
}

const AlphaTabContext = createContext<AlphaTabContextValue | null>(null);

function useAlphaTabContext(): AlphaTabContextValue {
    const ctx = useContext(AlphaTabContext);
    if (!ctx) {
        throw new Error('useAlphaTab* hooks must be used inside <AlphaTabPlayer>');
    }
    return ctx;
}

const noopSubscribe = () => () => {};
const noopSnapshot = () => initialAlphaTabState;

export function AlphaTabPlayer({ children }: { children: ReactNode }) {
    const module = useAlphaTabModule();
    const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null);
    const [scrollNode, setScrollNode] = useState<HTMLDivElement | null>(null);
    const [store, setStore] = useState<AlphaTabStore | null>(null);
    const { colorMode } = useColorMode();
    const colorModeRef = useRef(colorMode);
    colorModeRef.current = colorMode;

    const setMountElement = useCallback((node: HTMLDivElement | null) => {
        setMountNode(node);
    }, []);

    const setScrollElement = useCallback((node: HTMLDivElement | null) => {
        setScrollNode(node);
    }, []);

    useEffect(() => {
        if (!module || !mountNode || !scrollNode) return;

        const settings = new module.Settings();
        applyAlphaTabSettings(module, settings, { colorMode: colorModeRef.current });
        settings.player.scrollElement = scrollNode;
        settings.player.playerMode = module.PlayerMode.EnabledAutomatic;
        settings.player.scrollMode = module.ScrollMode.Continuous;
        settings.player.enableCursor = true;
        settings.player.enableElementHighlighting = true;

        const api = new module.AlphaTabApi(mountNode, settings);
        const s = new AlphaTabStore(api, module, colorModeRef.current);
        setStore(s);

        return () => {
            s.destroy();
            setStore(null);
        };
    }, [module, mountNode, scrollNode]);

    useEffect(() => {
        if (store) store.applyColorMode(colorMode);
    }, [store, colorMode]);

    const state = useSyncExternalStore(
        store ? store.subscribe : noopSubscribe,
        store ? store.getSnapshot : noopSnapshot,
        noopSnapshot,
    );

    const contextValue = useMemo(
        () => ({ state, store, setMountElement, setScrollElement }),
        [state, store, setMountElement, setScrollElement],
    );

    return <AlphaTabContext.Provider value={contextValue}>{children}</AlphaTabContext.Provider>;
}

interface AlphaTabCanvasProps {
    className?: string;
}

export function AlphaTabCanvas({ className }: AlphaTabCanvasProps) {
    const { setMountElement, setScrollElement } = useAlphaTabContext();
    return (
        <div ref={setScrollElement} className={className}>
            <div ref={setMountElement} />
        </div>
    );
}

export function useAlphaTabState(): AlphaTabState {
    return useAlphaTabContext().state;
}

export function useAlphaTabControls(): AlphaTabStore | null {
    return useAlphaTabContext().store;
}
