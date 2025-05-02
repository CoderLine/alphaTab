package alphaTab.platform.skia

import alphaTab.collections.toArray

internal class AlphaSkiaTextStyle : AutoCloseable {

    val textStyle: alphaTab.alphaSkia.AlphaSkiaTextStyle

    constructor(textStyle: alphaTab.alphaSkia.AlphaSkiaTextStyle) {
        this.textStyle = textStyle
    }

    val fontFamilies: alphaTab.collections.List<String> get() = alphaTab.collections.List(*this.textStyle.fontFamilies)
    val weight: Double get() = this.textStyle.weight.toDouble()
    val isItalic: Boolean get() = this.textStyle.isItalic

    constructor(familyNames: alphaTab.collections.List<String>, weight: Double, isItalic: Boolean)
        : this(
        alphaTab.alphaSkia.AlphaSkiaTextStyle(
            familyNames.toArray(),
            weight.toInt(),
            isItalic
        )
    )

    override fun close() {
        textStyle.close()
    }
}
