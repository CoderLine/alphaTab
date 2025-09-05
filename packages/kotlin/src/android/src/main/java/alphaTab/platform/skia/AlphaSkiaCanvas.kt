package alphaTab.platform.skia

@ExperimentalUnsignedTypes
internal class AlphaSkiaCanvas : AutoCloseable {
    companion object {
        fun rgbaToColor(r: Double, g: Double, b: Double, a: Double): UInt {
            return alphaTab.alphaSkia.AlphaSkiaCanvas.rgbaToColor(
                r.toInt().toByte(),
                g.toInt().toByte(),
                b.toInt().toByte(),
                a.toInt().toByte()
            ).toUInt()
        }
    }

    private val canvas: alphaTab.alphaSkia.AlphaSkiaCanvas = alphaTab.alphaSkia.AlphaSkiaCanvas()

    var color: UInt
        get() = this.canvas.color.toUInt()
        set(value) {
            this.canvas.color = value.toInt()
        }

    var lineWidth: Double
        get() = this.canvas.lineWidth.toDouble()
        set(value) {
            this.canvas.lineWidth = value.toFloat()
        }

    override fun close() {
        this.canvas.close()
    }

    fun beginRender(width: Double, height: Double, renderScale: Double = 1.0) {
        this.canvas.beginRender(width.toInt(), height.toInt(), renderScale.toFloat())
    }

    fun endRender(): AlphaSkiaImage {
        return AlphaSkiaImage(this.canvas.endRender())
    }

    fun fillRect(x: Double, y: Double, w: Double, h: Double) {
        this.canvas.fillRect(x.toFloat(), y.toFloat(), w.toFloat(), h.toFloat())
    }

    fun strokeRect(x: Double, y: Double, w: Double, h: Double) {
        this.canvas.strokeRect(x.toFloat(), y.toFloat(), w.toFloat(), h.toFloat())
    }

    fun beginPath() {
        this.canvas.beginPath()
    }

    fun closePath() {
        this.canvas.closePath()
    }

    fun moveTo(x: Double, y: Double) {
        this.canvas.moveTo(x.toFloat(), y.toFloat())
    }

    fun lineTo(x: Double, y: Double) {
        this.canvas.lineTo(x.toFloat(), y.toFloat())
    }

    fun quadraticCurveTo(cpx: Double, cpy: Double, x: Double, y: Double) {
        this.canvas.quadraticCurveTo(cpx.toFloat(), cpy.toFloat(), x.toFloat(), y.toFloat())
    }

    fun bezierCurveTo(
        cp1x: Double,
        cp1y: Double,
        cp2x: Double,
        cp2y: Double,
        x: Double,
        y: Double
    ) {
        this.canvas.bezierCurveTo(
            cp1x.toFloat(),
            cp1y.toFloat(),
            cp2x.toFloat(),
            cp2y.toFloat(),
            x.toFloat(),
            y.toFloat()
        )
    }

    fun fillCircle(x: Double, y: Double, radius: Double) {
        this.canvas.fillCircle(x.toFloat(), y.toFloat(), radius.toFloat())
    }

    fun strokeCircle(x: Double, y: Double, radius: Double) {
        this.canvas.strokeCircle(x.toFloat(), y.toFloat(), radius.toFloat())
    }

    fun fill() {
        this.canvas.fill()
    }

    fun stroke() {
        this.canvas.stroke()
    }

    fun fillText(
        text: String,
        textStyle: AlphaSkiaTextStyle,
        fontSize: Double,
        x: Double,
        y: Double,
        textAlign: AlphaSkiaTextAlign,
        textBaseline: AlphaSkiaTextBaseline
    ) {
        this.canvas.fillText(
            text,
            textStyle.textStyle,
            fontSize.toFloat(),
            x.toFloat(),
            y.toFloat(),
            textAlign.align,
            textBaseline.baseline
        )
    }

    fun measureText(
        text: String,
        textStyle: AlphaSkiaTextStyle,
        fontSize: Double,
        textAlign: AlphaSkiaTextAlign,
        textBaseline: AlphaSkiaTextBaseline

    ): AlphaSkiaTextMetrics {
        return AlphaSkiaTextMetrics(this.canvas.measureText(text, textStyle.textStyle, fontSize.toFloat(),
            textAlign.align,
            textBaseline.baseline
        ))
    }

    fun beginRotate(centerX: Double, centerY: Double, angle: Double) {
        this.canvas.beginRotate(centerX.toFloat(), centerY.toFloat(), angle.toFloat())
    }

    fun endRotate() {
        this.canvas.endRotate()
    }

    fun drawImage(image: AlphaSkiaImage, x: Double, y: Double, w: Double, h: Double) {
        this.canvas.drawImage(image.image, x.toFloat(), y.toFloat(), w.toFloat(), h.toFloat())
    }
}



