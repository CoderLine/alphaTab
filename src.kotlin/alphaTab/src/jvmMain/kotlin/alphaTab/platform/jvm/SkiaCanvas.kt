package alphaTab.platform.jvm

import alphaTab.Settings
import alphaTab.model.Color
import alphaTab.model.Font
import alphaTab.model.MusicFontSymbol
import alphaTab.platform.ICanvas
import alphaTab.platform.TextAlign
import alphaTab.platform.TextBaseline
import org.jetbrains.skija.*
import org.jetbrains.skija.shaper.Shaper
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
            it.strokeWidth = lineWidth.toFloat()
            it.mode = PaintMode.FILL
            _surface.canvas.drawPath(_path!!, it)
        }
    }


    override fun stroke() {
        createPaint().use {
            it.strokeWidth = lineWidth.toFloat()
            it.mode = PaintMode.STROKE
            _surface.canvas.drawPath(_path!!, it)
        }
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

            val yOffset = getFontBaseLine(
                textBaseline,
                font
            )

            // In Chrome some of the values are rounded with a +0.5f floor rounding
            // https://github.com/chromium/chromium/blob/99314be8152e688bafbbf9a615536bdbb289ea87/third_party/blink/renderer/platform/fonts/font_metrics.cc#L112
            // https://github.com/chromium/chromium/blob/99314be8152e688bafbbf9a615536bdbb289ea87/third_party/blink/renderer/modules/canvas/offscreencanvas2d/offscreen_canvas_rendering_context_2d.cc#L694
            val ascent = floor(-font.metrics.ascent + 0.5f)
            _surface.canvas.drawTextBlob(
                blob,
                x.toFloat() + xOffset,
                y.toFloat() + yOffset - ascent - font.metrics.leading,
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
                return -font.metrics.ascent * HangingAsPercentOfAscent / 100.0f
            TextBaseline.Middle -> {// kMiddleTextBaseline
                val normalized = computeNormalizedTypoAscentAndDescent(font)
                return (normalized[0] - normalized[1]) / 2.0f
            }
            TextBaseline.Bottom -> {// kBottomTextBaseline
                val normalized = computeNormalizedTypoAscentAndDescent(font)
                return -normalized[1]
            }
            else -> 0.0f
        }
    }

    private fun computeNormalizedTypoAscentAndDescent(font: org.jetbrains.skija.Font): Array<Float> {
        // https://github.com/chromium/chromium/blob/99314be8152e688bafbbf9a615536bdbb289ea87/third_party/blink/renderer/platform/fonts/simple_font_data.cc#L330
        val ascent: Float = -font.metrics.ascent
        val descent: Float = font.metrics.descent
        val emHeight: Float = font.size
        val height = ascent + descent

        val normalizedAscent = ascent * emHeight / height
        val normalizedDescent = emHeight - normalizedAscent
        return arrayOf(normalizedAscent, normalizedDescent)
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
            TextAlign.Center -> -blob.tightBounds.width / 2f
            TextAlign.Right -> -blob.tightBounds.width
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
