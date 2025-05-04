package alphaTab.platform.skia

internal class AlphaSkiaTextMetrics(val textMetrics: alphaTab.alphaSkia.AlphaSkiaTextMetrics) :
    AutoCloseable {

    val width: Double get() = textMetrics.width.toDouble()
    val actualBoundingBoxLeft: Double get() = textMetrics.actualBoundingBoxLeft.toDouble()
    val actualBoundingBoxRight: Double get() = textMetrics.actualBoundingBoxRight.toDouble()
    val fontBoundingBoxAscent: Double get() = textMetrics.fontBoundingBoxAscent.toDouble()
    val fontBoundingBoxDescent: Double get() = textMetrics.fontBoundingBoxDescent.toDouble()
    val actualBoundingBoxAscent: Double get() = textMetrics.actualBoundingBoxAscent.toDouble()
    val actualBoundingBoxDescent: Double get() = textMetrics.actualBoundingBoxDescent.toDouble()
    val emHeightAscent: Double get() = textMetrics.emHeightAscent.toDouble()
    val emHeightDescent: Double get() = textMetrics.emHeightDescent.toDouble()
    val hangingBaseline: Double get() = textMetrics.hangingBaseline.toDouble()
    val alphabeticBaseline: Double get() = textMetrics.alphabeticBaseline.toDouble()
    val ideographicBaseline: Double get() = textMetrics.ideographicBaseline.toDouble()

    override fun close() {
        textMetrics.close()
    }
}
