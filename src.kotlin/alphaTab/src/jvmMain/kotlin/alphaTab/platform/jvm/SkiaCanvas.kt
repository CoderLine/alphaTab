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

// TODO
val MusicFont: Typeface = Typeface.makeDefault()
const val MusicFontSize = 34

@ExperimentalUnsignedTypes
@ExperimentalContracts
class SkiaCanvas : ICanvas {
    private lateinit var _surface: Surface
    private lateinit var _path: Path
    private var _typeFaceCache: String = ""
    private lateinit var _typeFace: Typeface

    public override var color: Color = Color(255.0, 255.0, 255.0)
    public override var lineWidth: Double = 1.0
    public override var font: Font = Font("Arial", 10.0)
    private val typeFace: Typeface
        get() {
            if (_typeFaceCache != font.toCssString(settings.display.scale)) {
                _typeFace.close()
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
            return _typeFace
        }


    public override var textAlign: TextAlign = TextAlign.Left
    public override var textBaseline: TextBaseline = TextBaseline.Top
    public override lateinit var settings: Settings

    override fun beginRender(width: Double, height: Double) {
        val newImage = Surface.makeRaster(
            ImageInfo(
                width.toInt(),
                height.toInt(),
                ColorType.BGRA_8888 /* TODO check for right default */,
                ColorAlphaType.PREMUL
            )
        )
        _surface = newImage
        _path.close()

        _path = Path()
        _path.fillMode = PathFillMode.WINDING
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
            _surface.canvas.drawRect(Rect(x.toFloat(), y.toFloat(), w.toFloat(), h.toFloat()), it)
        }
    }

    private fun createPaint(): Paint {
        val paint = Paint()
        paint.isAntiAlias = true
        paint.isDither = false
//        paint.subpixelText = true
//        paint.deviceKerningEnabled = true
        paint.color = color.raw.toInt()
        return paint
    }

    override fun strokeRect(x: Double, y: Double, w: Double, h: Double) {
        createPaint().use {
            it.blendMode = BlendMode.SRC_OVER
            it.mode = PaintMode.STROKE
            _surface.canvas.drawRect(Rect(x.toFloat(), y.toFloat(), w.toFloat(), h.toFloat()), it)
        }
    }

    override fun beginPath() {
        _path.reset()
    }

    override fun closePath() {
        _path.closePath()
    }

    override fun moveTo(x: Double, y: Double) {
        _path.moveTo(x.toFloat(), y.toFloat())
    }

    override fun lineTo(x: Double, y: Double) {
        _path.lineTo(x.toFloat(), y.toFloat())
    }

    override fun quadraticCurveTo(cpx: Double, cpy: Double, x: Double, y: Double) {
        _path.quadTo(cpx.toFloat(), cpy.toFloat(), x.toFloat(), y.toFloat())
    }

    override fun bezierCurveTo(
        cp1X: Double,
        cp1Y: Double,
        cp2X: Double,
        cp2Y: Double,
        x: Double,
        y: Double
    ) {
        _path.cubicTo(
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
        _path.addCircle(x.toFloat(), y.toFloat(), radius.toFloat())
        closePath()
        fill()
    }


    override fun strokeCircle(x: Double, y: Double, radius: Double) {
        beginPath()
        _path.addCircle(x.toFloat(), y.toFloat(), radius.toFloat())
        closePath()
        stroke()
    }

    override fun fill() {
        createPaint().use {
            it.strokeWidth = lineWidth.toFloat()
            it.mode = PaintMode.FILL
            _surface.canvas.drawPath(_path, it)
        }
    }


    override fun stroke() {
        createPaint().use {
            it.strokeWidth = lineWidth.toFloat()
            it.mode = PaintMode.STROKE
            _surface.canvas.drawPath(_path, it)
        }
    }

    override fun beginGroup(identifier: String) {
    }

    override fun endGroup() {
    }

    override fun fillText(text: String, x: Double, y: Double) {
        textRun(text, fun(blob, font, paint) {
            _surface.canvas.drawTextBlob(
                blob,
                x.toFloat(),
                y.toFloat() + getFontBaseLine(textBaseline, font),
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

    private fun getFontBaseLine(textBaseline: TextBaseline, font: org.jetbrains.skija.Font): Float {
        return when (textBaseline) {
            TextBaseline.Top -> // TopTextBaseline
                // https://chromium.googlesource.com/chromium/blink/+/master/Source/modules/canvas2d/CanvasRenderingContext2D.cpp#2056
                // According to http://wiki.apache.org/xmlgraphics-fop/LineLayout/AlignmentHandling
                // "FOP (Formatting Objects Processor) puts the hanging baseline at 80% of the ascender height"
                return (-font.metrics.ascent * 4) / 5
            TextBaseline.Middle -> // MiddleTextBaseline
                return -font.metrics.descent + font.size / 2
            TextBaseline.Bottom -> // BottomTextBaseline
                return -font.metrics.descent
            else -> 0.0f
        }
    }

    override fun measureText(text: String): Double {
        if (text.isEmpty()) {
            return 0.0
        }

        var size = 0.0
        textRun(text, fun(_, font, paint) {
            size = font.measureText(text, paint).width.toDouble()
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
                        _surface.canvas.drawTextBlob(blob, x.toFloat(), y.toFloat(), paint)
                    }
                }
            }
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
