package alphaTab.platform.skia

actual enum class AlphaSkiaTextBaseline(internal val align: alphaTab.alphaSkia.AlphaSkiaTextBaseline) {
    Alphabetic(alphaTab.alphaSkia.AlphaSkiaTextBaseline.ALPHABETIC),
    Top(alphaTab.alphaSkia.AlphaSkiaTextBaseline.TOP),
    Middle(alphaTab.alphaSkia.AlphaSkiaTextBaseline.MIDDLE),
    Bottom(alphaTab.alphaSkia.AlphaSkiaTextBaseline.BOTTOM)
}
