package alphaTab.platform.svg

import alphaTab.core.ecmaScript.Uint8Array
import kotlin.contracts.ExperimentalContracts

internal class FontSizesPartials {
    companion object {
        @ExperimentalUnsignedTypes
        @ExperimentalContracts
        public fun generateFontLookup(family: String) {
            if (FontSizes.FontSizeLookupTables.has(family)) {
                return
            }

            // TODO: maybe allow fallback to System Rendering / Skia based on availability?
            FontSizes.FontSizeLookupTables.set(family, Uint8Array(ubyteArrayOf((8).toUByte())))
        }
    }
}
