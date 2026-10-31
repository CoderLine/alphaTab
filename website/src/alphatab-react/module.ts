import * as alphaTab from '@coderline/alphatab';

export type AlphaTabModule = typeof alphaTab;

export function useAlphaTabModule(): AlphaTabModule {
    return alphaTab;
}
