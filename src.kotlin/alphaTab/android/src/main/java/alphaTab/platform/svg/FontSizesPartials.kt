package alphaTab.platform.svg

import alphaTab.alphaSkia.AlphaSkiaCanvas
import alphaTab.alphaSkia.AlphaSkiaTextAlign
import alphaTab.alphaSkia.AlphaSkiaTextBaseline
import alphaTab.alphaSkia.AlphaSkiaTextStyle
import alphaTab.collections.DoubleList
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

            val measureSize = 11f

            val widths = DoubleList()
            val heights = DoubleList()

            AlphaSkiaCanvas().use { canvas ->
                canvas.beginRender(10,10)

                AlphaSkiaTextStyle(arrayOf(family), 400, false).use { style ->
                    for(i in (FontSizes.ControlChars.toInt() until 255)) {
                        val s = i.toChar().toString()
                        canvas.measureText(s, style, measureSize, AlphaSkiaTextAlign.LEFT, AlphaSkiaTextBaseline.ALPHABETIC).use{metrics ->
                            widths.push(metrics.width.toDouble())
                            val height = metrics.actualBoundingBoxDescent + metrics.actualBoundingBoxAscent
                            heights.push(height.toDouble())
                        }
                    }
                }

                canvas.endRender().close()
            }

            FontSizes.FontSizeLookupTables.set(family, FontSizeDefinition(Uint8Array(widths), Uint8Array(heights)))
        }
    }
}
