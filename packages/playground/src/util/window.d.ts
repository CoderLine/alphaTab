import type * as alphaTab from '@coderline/alphatab';

declare global {
    interface Window {
        api?: alphaTab.AlphaTabApi;
        alphaTab?: typeof alphaTab;
    }
}
