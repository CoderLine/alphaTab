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
import { SelectionHandles } from './selection-handles';

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
        // Match the landing chrome's default flyout state (Layout = Page). The
        // consumer's setLayoutMode() can switch to Horizontal + Continuous.
        settings.display.layoutMode = module.LayoutMode.Page;
        settings.player.scrollMode = module.ScrollMode.Off;
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
    const { setMountElement, setScrollElement, store } = useAlphaTabContext();
    // Track the mount node so <SelectionHandles> can measure mouse coordinates
    // against alphaTab's render surface.
    const [mountNode, setLocalMountNode] = useState<HTMLDivElement | null>(null);
    const combinedMountRef = useCallback((node: HTMLDivElement | null) => {
        setLocalMountNode(node);
        setMountElement(node);
    }, [setMountElement]);
    const api = store?.getApi();

    return (
        <div ref={setScrollElement} className={className}>
            {/* Positioning context so the selection-handle overlay's absolute
                inset:0 covers the mount div's full render surface, not just the
                scroll container's visible viewport. */}
            <div style={{ position: 'relative' }}>
                <div ref={combinedMountRef} />
                <SelectionHandles api={api} mountElement={mountNode} />
            </div>
        </div>
    );
}

export function useAlphaTabState(): AlphaTabState {
    return useAlphaTabContext().state;
}

export function useAlphaTabControls(): AlphaTabStore | null {
    return useAlphaTabContext().store;
}
