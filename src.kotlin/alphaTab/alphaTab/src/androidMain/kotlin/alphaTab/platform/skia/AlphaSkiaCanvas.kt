package alphaTab.platform.skia

@ExperimentalUnsignedTypes
actual class AlphaSkiaCanvas : AutoCloseable {
    actual companion object {
        actual fun rgbaToColor(r: Double, g: Double, b: Double, a: Double): Int {
            return alphaTab.alphaSkia.AlphaSkiaCanvas.rgbaToColor(
                r.toInt().toByte(),
                g.toInt().toByte(),
                b.toInt().toByte(),
                a.toInt().toByte()
            )
        }
    }

    private val canvas: alphaTab.alphaSkia.AlphaSkiaCanvas = alphaTab.alphaSkia.AlphaSkiaCanvas()

    actual var color: Int
        get() = this.canvas.color
        set(value) {
            this.canvas.color = value
        }

    actual var lineWidth: Double
        get() = this.canvas.lineWidth.toDouble()
        set(value) {
            this.canvas.lineWidth = value.toFloat()
        }

    override fun close() {
        this.canvas.close()
    }

    actual fun beginRender(width: Double, height: Double, renderScale: Double) {
        this.canvas.beginRender(width.toInt(), height.toInt(), renderScale.toFloat())
    }

    actual fun endRender(): AlphaSkiaImage {
        return AlphaSkiaImage(this.canvas.endRender()!!)
    }

    actual fun fillRect(x: Double, y: Double, w: Double, h: Double) {
        this.canvas.fillRect(x.toFloat(), y.toFloat(), w.toFloat(), h.toFloat())
    }

    actual fun strokeRect(x: Double, y: Double, w: Double, h: Double) {
        this.canvas.strokeRect(x.toFloat(), y.toFloat(), w.toFloat(), h.toFloat())
    }

    actual fun beginPath() {
        this.canvas.beginPath()
    }

    actual fun closePath() {
        this.canvas.closePath()
    }

    actual fun moveTo(x: Double, y: Double) {
        this.canvas.moveTo(x.toFloat(), y.toFloat())
    }

    actual fun lineTo(x: Double, y: Double) {
        this.canvas.lineTo(x.toFloat(), y.toFloat())
    }

    actual fun quadraticCurveTo(cpx: Double, cpy: Double, x: Double, y: Double) {
        this.canvas.quadraticCurveTo(cpx.toFloat(), cpy.toFloat(), x.toFloat(), y.toFloat())
    }

    actual fun bezierCurveTo(
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

    actual fun fillCircle(x: Double, y: Double, radius: Double) {
        this.canvas.fillCircle(x.toFloat(), y.toFloat(), radius.toFloat())
    }

    actual fun strokeCircle(x: Double, y: Double, radius: Double) {
        this.canvas.strokeCircle(x.toFloat(), y.toFloat(), radius.toFloat())
    }

    actual fun fill() {
        this.canvas.fill()
    }

    actual fun stroke() {
        this.canvas.stroke()
    }

    actual fun fillText(
        text: String,
        typeFace: AlphaSkiaTypeface,
        fontSize: Double,
        x: Double,
        y: Double,
        textAlign: AlphaSkiaTextAlign,
        textBaseline: AlphaSkiaTextBaseline
    ) {
        this.canvas.fillText(
            text,
            typeFace.typeface,
            fontSize.toFloat(),
            x.toFloat(),
            y.toFloat(),
            textAlign.align,
            textBaseline.align
        )
    }

    actual fun measureText(
        text: String,
        typeFace: AlphaSkiaTypeface,
        fontSize: Double
    ): Double {
        return this.canvas.measureText(text, typeFace.typeface, fontSize.toFloat()).toDouble()
    }

    actual fun beginRotate(centerX: Double, centerY: Double, angle: Double) {
        this.canvas.beginRotate(centerX.toFloat(), centerY.toFloat(), angle.toFloat())
    }

    actual fun endRotate() {
        this.canvas.endRotate()
    }

    actual fun drawImage(image: AlphaSkiaImage, x: Double, y: Double, w: Double, h: Double) {
        this.canvas.drawImage(image.image, x.toFloat(), y.toFloat(), w.toFloat(), h.toFloat())
    }
}



