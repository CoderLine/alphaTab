package alphaTab.platform.skia

expect class AlphaSkiaCanvas : AutoCloseable {
    companion object {
        fun rgbaToColor(r: Double, g: Double, b: Double, a: Double): Int
    }

    var color: Int
    var lineWidth: Double
    fun beginRender(width: Double, height: Double, renderScale: Double = 1.0)
    fun endRender(): AlphaSkiaImage
    fun fillRect(x: Double, y: Double, w: Double, h: Double)
    fun strokeRect(x: Double, y: Double, w: Double, h: Double)
    fun beginPath()
    fun closePath()
    fun moveTo(x: Double, y: Double)
    fun lineTo(x: Double, y: Double)
    fun quadraticCurveTo(cpx: Double, cpy: Double, x: Double, y: Double)
    fun bezierCurveTo(
        cp1x: Double,
        cp1y: Double,
        cp2x: Double,
        cp2y: Double,
        x: Double,
        y: Double
    )

    fun fillCircle(x: Double, y: Double, radius: Double)
    fun strokeCircle(x: Double, y: Double, radius: Double)
    fun fill()
    fun stroke()

    fun fillText(
        text: String,
        typeFace: AlphaSkiaTypeface,
        fontSize: Double,
        x: Double,
        y: Double,
        textAlign: AlphaSkiaTextAlign,
        textBaseline: AlphaSkiaTextBaseline
    )
    fun measureText(
        text: String,
        typeFace: AlphaSkiaTypeface,
        fontSize: Double
    ): Double
    fun beginRotate(centerX: Double, centerY: Double, angle: Double)
    fun endRotate()
    fun drawImage(image: AlphaSkiaImage, x: Double, y: Double, w: Double, h: Double)
}



