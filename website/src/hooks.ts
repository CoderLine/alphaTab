import React, { type DependencyList, type EffectCallback, useEffect, useRef, useState } from "react";
import * as alphaTab from "@coderline/alphatab";
import environment from "./environment";
import {useColorMode} from '@docusaurus/theme-common';

export function useAlphaTab(
  settingsInit: (settings: alphaTab.Settings) => void,
): [
    api: alphaTab.AlphaTabApi | undefined,
    elementRef: React.RefObject<HTMLDivElement | null>
  ] {
  const [api, setApi] = useState<alphaTab.AlphaTabApi>();
  const element = React.createRef<HTMLDivElement>();

  const { colorMode } = useColorMode();

  useEffect(()=>{
    if(api) {
      environment.setAlphaTabColors(api.settings, colorMode);
      api.updateSettings();
      if(api.score) {
        api.render();
      }
    }
  }, [api, colorMode]);

  // for easier testing and troubleshooting
  useEffect(()=>{
    const e = element.current as any; 
    e.at = api;
    return ()=>{
      e.at = undefined;
    }
  }, [api, element.current])

  useEffect(
    () => {
      const container = element.current;
      if (!container) {
        return;
      }

      const settings = new alphaTab.Settings();
      environment.setAlphaTabDefaults(settings, colorMode);
      settingsInit(settings);

      const newApi = new alphaTab.AlphaTabApi(container, settings);
      setApi(newApi);

      return () => {
        newApi.destroy();
      };
    },
    // on component mounted
    []
  );

  return [api, element];
}

export type AlphaTabApiEvents = {
  [K in keyof alphaTab.AlphaTabApi as alphaTab.AlphaTabApi[K] extends
  | alphaTab.IEventEmitter
  | alphaTab.IEventEmitterOfT<any>
  ? K
  : never]: alphaTab.AlphaTabApi[K];
};

export function useAlphaTabEvent<
  T extends keyof AlphaTabApiEvents,
  H extends Parameters<alphaTab.AlphaTabApi[T]["on"]>[0]
>(api: alphaTab.AlphaTabApi | undefined, event: T, handler: H, deps?: DependencyList) {
  useEffect(() => {
    if (api) {
      api[event].on(handler as any);
      return () => {
        api[event].off(handler as any);
      };
    }
  }, [api, event, ...(deps ?? [])]);
}

export const useIsMount = () => {
  const isMountRef = useRef(true);
  useEffect(() => {
    isMountRef.current = false;
  }, []);
  return isMountRef.current;
};

export const useEffectNoMount = (effect: EffectCallback, deps?: DependencyList) => {
  const isMount = useIsMount();
  useEffect(() => {
    if (!isMount) {
      effect();
    }
  }, deps)
};