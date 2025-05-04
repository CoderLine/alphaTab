package alphaTab.platform.skia

internal enum class AlphaSkiaTextBaseline(internal val baseline: alphaTab.alphaSkia.AlphaSkiaTextBaseline) {
    Alphabetic(alphaTab.alphaSkia.AlphaSkiaTextBaseline.ALPHABETIC),
    Top(alphaTab.alphaSkia.AlphaSkiaTextBaseline.TOP),
    Middle(alphaTab.alphaSkia.AlphaSkiaTextBaseline.MIDDLE),
    Bottom(alphaTab.alphaSkia.AlphaSkiaTextBaseline.BOTTOM)
}
