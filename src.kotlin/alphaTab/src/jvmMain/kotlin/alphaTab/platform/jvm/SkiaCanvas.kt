package alphaTab.platform.jvm

import alphaTab.Settings
import alphaTab.core.BitConverter
import alphaTab.model.Color
import alphaTab.model.Font
import alphaTab.model.MusicFontSymbol
import alphaTab.platform.ICanvas
import alphaTab.platform.TextAlign
import alphaTab.platform.TextBaseline
import org.jetbrains.skija.*
import org.jetbrains.skija.shaper.Shaper
import java.lang.IllegalStateException
import kotlin.contracts.ExperimentalContracts
import kotlin.math.floor

@ExperimentalUnsignedTypes
@ExperimentalContracts
val bravuraTtf = SkiaCanvas::class.java.getResource("/bravura/Bravura.ttf").readBytes()

@ExperimentalUnsignedTypes
@ExperimentalContracts
val MusicFont: Typeface = Typeface.makeFromData(Data.makeFromBytes(bravuraTtf))
const val MusicFontSize = 34

const val HangingAsPercentOfAscent = 80

// https://github.com/chromium/chromium/blob/99314be8152e688bafbbf9a615536bdbb289ea87/third_party/blink/renderer/modules/canvas/offscreencanvas2d/offscreen_canvas_rendering_context_2d.cc

@ExperimentalUnsignedTypes
@ExperimentalContracts
class SkiaCanvas : ICanvas {
    private lateinit var _surface: Surface
    private var _path: Path? = null
    private var _typeFaceCache: String = ""
    private var _typeFace: Typeface? = null

    public override var color: Color = Color(255.0, 255.0, 255.0)
    public override var lineWidth: Double = 1.0
    public override var font: Font = Font("Arial", 10.0)
    private val typeFace: Typeface
        get() {
            if (_typeFaceCache != font.toCssString(settings.display.scale)) {
                _typeFace?.close()
                _typeFaceCache = font.toCssString(settings.display.scale)
                _typeFace = Typeface.makeFromName(
                    font.family,
                    FontStyle(
                        if (font.isBold) FontStyle.BOLD.weight else FontStyle.NORMAL.weight,
                        FontStyle.NORMAL.width,
                        if (font.isItalic) FontStyle.ITALIC.slant else FontStyle.NORMAL.slant
                    )
                )
            }
            return _typeFace!!
        }


    public override var textAlign: TextAlign = TextAlign.Left
    public override var textBaseline: TextBaseline = TextBaseline.Top
    public override lateinit var settings: Settings

    override fun beginRender(width: Double, height: Double) {
        val newImage = Surface.makeRaster(
            ImageInfo(
                width.toInt(),
                height.toInt(),
                ColorType.BGRA_8888,
                ColorAlphaType.PREMUL
            )
        )
        _surface = newImage
        _path?.close()

        textBaseline = TextBaseline.Top

        val path = Path()
        path.fillMode = PathFillMode.WINDING
        _path = path
    }

    override fun endRender(): Any? {
        val image = _surface.makeImageSnapshot()
        _surface.close()
        return image
    }

    override fun onRenderFinished(): Any? {
        return null
    }

    override fun fillRect(x: Double, y: Double, w: Double, h: Double) {
        createPaint().use {
            it.blendMode = BlendMode.SRC_OVER
            it.mode = PaintMode.FILL
            _surface.canvas.drawRect(
                Rect(
                    x.toInt().toFloat(),
                    y.toInt().toFloat(),
                    (x.toInt() + w).toFloat(),
                    (y.toInt() + h).toFloat()
                ), it
            )
        }
    }

    private fun createPaint(): Paint {
        val paint = Paint()
        paint.isAntiAlias = true
        paint.isDither = false
        paint.setARGB(color.a.toInt(), color.r.toInt(), color.g.toInt(), color.b.toInt())
        return paint
    }

    override fun strokeRect(x: Double, y: Double, w: Double, h: Double) {
        createPaint().use {
            it.blendMode = BlendMode.SRC_OVER
            it.mode = PaintMode.STROKE
            _surface.canvas.drawRect(
                Rect(
                    x.toInt().toFloat(),
                    y.toInt().toFloat(),
                    (x.toInt() + w).toFloat(),
                    (y.toInt() + h).toFloat()
                ), it
            )
        }
    }

    override fun beginPath() {
        _path!!.reset()
    }

    override fun closePath() {
        _path!!.closePath()
    }

    override fun moveTo(x: Double, y: Double) {
        _path!!.moveTo(x.toFloat(), y.toFloat())
    }

    override fun lineTo(x: Double, y: Double) {
        _path!!.lineTo(x.toFloat(), y.toFloat())
    }

    override fun quadraticCurveTo(cpx: Double, cpy: Double, x: Double, y: Double) {
        _path!!.quadTo(cpx.toFloat(), cpy.toFloat(), x.toFloat(), y.toFloat())
    }

    override fun bezierCurveTo(
        cp1X: Double,
        cp1Y: Double,
        cp2X: Double,
        cp2Y: Double,
        x: Double,
        y: Double
    ) {
        _path!!.cubicTo(
            cp1X.toFloat(),
            cp1Y.toFloat(),
            cp2X.toFloat(),
            cp2Y.toFloat(),
            x.toFloat(),
            y.toFloat()
        )
    }

    override fun fillCircle(x: Double, y: Double, radius: Double) {
        beginPath()
        _path!!.addCircle(x.toFloat(), y.toFloat(), radius.toFloat())
        closePath()
        fill()
    }


    override fun strokeCircle(x: Double, y: Double, radius: Double) {
        beginPath()
        _path!!.addCircle(x.toFloat(), y.toFloat(), radius.toFloat())
        closePath()
        stroke()
    }

    override fun fill() {
        createPaint().use {
            it.strokeWidth = 0f
            it.mode = PaintMode.FILL
            _surface.canvas.drawPath(_path!!, it)
        }
        _path!!.reset()
    }


    override fun stroke() {
        createPaint().use {
            it.strokeWidth = lineWidth.toFloat()
            it.mode = PaintMode.STROKE
            _surface.canvas.drawPath(_path!!, it)
        }
        _path!!.reset()
    }

    override fun beginGroup(identifier: String) {
    }

    override fun endGroup() {
    }

    override fun fillText(text: String, x: Double, y: Double) {
        textRun(text, fun(blob, font, paint) {
            val xOffset = getFontOffset(
                textAlign,
                blob
            )

            val fontBaseLine = getFontBaseLine(
                textBaseline,
                font
            )

            val ascent = floatAscent(font.metrics)
            _surface.canvas.drawTextBlob(
                blob,
                x.toFloat() + xOffset,
                y.toFloat() + fontBaseLine - ascent - skScalarRoundToScalar(font.metrics.leading),
                paint
            )
        })
    }

    private fun textRun(
        text: String,
        action: (blob: TextBlob, font: org.jetbrains.skija.Font, paint: Paint) -> Unit
    ) {
        val paint = createPaint()
        paint.use {
            val shaper = Shaper.make()
            shaper.use {
                val font = Font(typeFace, this.font.size.toFloat())
                font.edging = FontEdging.ANTI_ALIAS
                font.isSubpixel = true
                font.hinting = FontHinting.NORMAL
                font.use {
                    val blob = shaper.shape(text, font)
                    blob?.use {
                        action(blob, font, paint)
                    }
                }
            }
        }
    }

    private fun getFontBaseLine(
        textBaseline: TextBaseline,
        font: org.jetbrains.skija.Font
    ): Float {
        // https://github.com/chromium/chromium/blob/99314be8152e688bafbbf9a615536bdbb289ea87/third_party/blink/renderer/core/html/canvas/text_metrics.cc#L14
        return when (textBaseline) {
            TextBaseline.Top -> // kHangingTextBaseline
                return floatAscent(font.metrics) * HangingAsPercentOfAscent / 100.0f
            TextBaseline.Middle -> {// kMiddleTextBaseline
                val (emHeightAscent, emHeightDescent) = emHeightAscentDescent(font)
                return (emHeightAscent - emHeightDescent) / 2.0f
            }
            TextBaseline.Bottom -> {// kBottomTextBaseline
                val (_, emHeightDescent) = emHeightAscentDescent(font)
                return -emHeightDescent
            }
            else -> 0.0f
        }
    }

    private fun emHeightAscentDescent(font: org.jetbrains.skija.Font): Pair<Float, Float> {
        val typeface = font.typeface!!
        val (typoAscent, typeDecent) = typoAscenderDescender(typeface)
        if (typoAscent > 0) {
            val normalized = normalizeEmHeightMetrics(
                font,
                typoAscent.toFloat(),
                (typoAscent + typeDecent).toFloat()
            )
            if (normalized != null) {
                return normalized
            }
        }

        val metrics = font.metrics
        val metricAscent = floatAscent(metrics)
        val metricDescent = floatDescent(metrics)
        val normalized = normalizeEmHeightMetrics(font, metricAscent, metricAscent + metricDescent)
        if (normalized != null) {
            return normalized
        }

        throw IllegalStateException("Cannot compute ascent and descent")
    }

    private fun normalizeEmHeightMetrics(
        font: org.jetbrains.skija.Font,
        ascent: Float,
        height: Float
    ): Pair<Float, Float>? {
        if (height <= 0 || ascent < 0 || ascent > height) {
            return null
        }

        val emHeight = font.size
        val emHeightAscent = ascent * emHeight / height
        val emHeightDescent = emHeight - emHeightAscent
        return Pair(emHeightAscent, emHeightDescent)
    }

    private fun typoAscenderDescender(typeface: Typeface): Pair<Short, Short> {
        val buffer = typeface.getTableData("OS/2")
        if (buffer != null && buffer.size >= 72) {
            val ascender = BitConverter.getInt16 (buffer.bytes, 68, false)
            val descender = -BitConverter.getInt16 (buffer.bytes, 70, false)
            return Pair(ascender, descender.toShort())
        }

        return Pair(0.toShort(), 0.toShort())
    }

    private fun floatAscent(metrics: FontMetrics): Float {
        return skScalarRoundToScalar(-metrics.ascent)
    }

    private fun floatDescent(metrics: FontMetrics): Float {
        return skScalarRoundToScalar(metrics.descent)
    }

    private fun skScalarRoundToScalar(x: Float): Float {
        return floor(x + 0.5f)
    }

    override fun measureText(text: String): Double {
        if (text.isEmpty()) {
            return 0.0
        }
        var size = 0.0
        textRun(text, fun(blob, _, _) {
            size = blob.blockBounds.width.toDouble()
        })
        return size
    }

    override fun fillMusicFontSymbol(
        x: Double,
        y: Double,
        scale: Double,
        symbol: MusicFontSymbol,
        centerAtPosition: Boolean?
    ) {
        fillMusicFontSymbols(x, y, scale, mutableListOf(symbol), centerAtPosition)
    }

    override fun fillMusicFontSymbols(
        x: Double,
        y: Double,
        scale: Double,
        symbols: MutableList<MusicFontSymbol>,
        centerAtPosition: Boolean?
    ) {
        val s = String(symbols
            .filter { it != MusicFontSymbol.None }
            .map { it.value.toChar() }
            .toCharArray()
        )

        val paint = createPaint()
        paint.use {
            val shaper = Shaper.make()
            shaper.use {
                val font = Font(MusicFont, (MusicFontSize * scale).toFloat())
                font.edging = FontEdging.ANTI_ALIAS
                font.isSubpixel = true
                font.hinting = FontHinting.NORMAL
                font.use {
                    val blob = shaper.shape(s, font)
                    blob?.use {
                        val xOffset = getFontOffset(
                            if (centerAtPosition == true) TextAlign.Center else TextAlign.Left,
                            it
                        )
                        _surface.canvas.drawTextBlob(
                            blob,
                            x.toFloat() + xOffset,
                            y.toFloat() - font.metrics.descent,
                            paint
                        )
                    }
                }
            }
        }
    }

    private fun getFontOffset(textAlign: TextAlign, blob: TextBlob): Float {
        return when (textAlign) {
            TextAlign.Left -> 0f
            TextAlign.Center -> -blob.blockBounds.width / 2f
            TextAlign.Right -> -blob.blockBounds.width
        }
    }

    override fun beginRotate(centerX: Double, centerY: Double, angle: Double) {
        _surface.canvas.save()
        _surface.canvas.translate(centerX.toFloat(), centerY.toFloat())
        _surface.canvas.rotate(angle.toFloat())
    }

    override fun endRotate() {
        _surface.canvas.restore()
    }
}
