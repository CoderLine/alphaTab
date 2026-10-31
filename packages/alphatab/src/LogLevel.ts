/**
 * Defines all loglevels.
 * @json
 * @public
 */
export enum LogLevel {
    // Kotlin orders enum members by declaration, so the members must stay sorted by value.
    /**
     * Trace level (high-volume internal flow details, implies all other levels).
     * @remarks
     * The published JavaScript files do not contain trace messages; they are only written when running alphaTab
     * from its TypeScript sources and on .NET and Android.
     * @since 1.9.0
     */
    Trace = -1,
    /**
     * No logging
     */
    None = 0,
    /**
     * Debug level (internal details are displayed).
     */
    Debug = 1,
    /**
     * Info level (only important details are shown)
     */
    Info = 2,
    /**
     * Warning level
     */
    Warning = 3,
    /**
     * Error level.
     */
    Error = 4
}
