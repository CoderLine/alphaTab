const isDevelopment: boolean = (() => {
    try {
        // bundlers replace this expression; without one, `process` may not exist
        return process.env.NODE_ENV !== 'production';
    } catch {
        return true;
    }
})();

/**
 * Logs a misuse warning outside production builds.
 * @internal
 */
export function warnInDevelopment(message: string): void {
    if (isDevelopment) {
        console.warn(`[alphaTab React] ${message}`);
    }
}
