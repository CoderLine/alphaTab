package alphaTab.platform.android

import alphaTab.Environment
import alphaTab.Settings
import alphaTab.core.toCharArray
import alphaTab.model.Color
import alphaTab.model.Font
import alphaTab.model.MusicFontSymbol
import alphaTab.platform.ICanvas
import alphaTab.platform.TextAlign
import alphaTab.platform.TextBaseline
import android.content.Context
import android.graphics.*
import android.util.DisplayMetrics
import java.io.ByteArrayOutputStream
import kotlin.contracts.ExperimentalContracts

@ExperimentalUnsignedTypes
@ExperimentalContracts
lateinit var MusicFont: Typeface
const val MusicFontSize = 34

const val HangingAsPercentOfAscent = 80

val CustomTypeFaces = HashMap<String, Typeface>()

@ExperimentalUnsignedTypes
@ExperimentalContracts
internal class AndroidCanvas : ICanvas {
    companion object {
        public fun initialize(context: Context) {
            MusicFont = Typeface.createFromAsset(context.assets, "Bravura.ttf")
        }

        public fun registerCustomFont(name: String, face: Typeface) {
            CustomTypeFaces[customTypeFaceKey(name, face)] = face
        }

        private fun customTypeFaceKey(name: String, typeface: Typeface): String {
            return customTypeFaceKey(name, typeface.isBold, typeface.isItalic)
        }

        private fun customTypeFaceKey(
            fontFamily: String,
            isBold: Boolean,
            isItalic: Boolean
        ): String {
            return fontFamily.lowercase() + "_" + isBold + "_" + isItalic
        }
    }

    private lateinit var _surface: Bitmap
    private lateinit var _canvas: Canvas
    private var _path: Path? = null
    private var _typeFaceCache: String = ""
    private var _typeFace: Typeface? = null

    public override var color: Color = Color(255.0, 255.0, 255.0)
    public override var lineWidth: Double = 1.0
    public override var font: Font = Font("Arial", 10.0)
    private val typeFace: Typeface
        get() {
            if (_typeFaceCache != font.toCssString(settings.display.scale)) {
                _typeFaceCache = font.toCssString(settings.display.scale)

                val key = customTypeFaceKey(font.family, font.isBold, font.isItalic)
                _typeFace = if (!CustomTypeFaces.containsKey(key)) {
                    Typeface.create(
                        font.family,
                        if (font.isBold && font.isItalic) Typeface.BOLD_ITALIC
                        else if (font.isBold) Typeface.BOLD
                        else Typeface.NORMAL
                    )
                } else {
                    CustomTypeFaces[key]!!
                }
            }
            return _typeFace!!
        }


    public override var textAlign: TextAlign = TextAlign.Left
    public override var textBaseline: TextBaseline = TextBaseline.Top
    public override lateinit var settings: Settings

    override fun beginRender(width: Double, height: Double) {
        val newImage = Bitmap.createBitmap(
            (width * Environment.HighDpiFactor).toInt(),
            (height * Environment.HighDpiFactor).toInt(),
            Bitmap.Config.ARGB_8888
        )
        newImage.isPremultiplied = true

        _surface = newImage
        _canvas = Canvas(_surface)
        _canvas.scale(Environment.HighDpiFactor.toFloat(), Environment.HighDpiFactor.toFloat())
        _path?.close()

        textBaseline = TextBaseline.Top

        val path = Path()
        path.fillType = Path.FillType.WINDING
        _path = path
    }

    override fun endRender(): Any {
        return _surface
    }

    override fun onRenderFinished(): Any? {
        return null
    }

    override fun fillRect(x: Double, y: Double, w: Double, h: Double) {
        createPaint().let {
            it.style = Paint.Style.FILL
            _canvas.drawRect(
                RectF(
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
        createPaint().let {
            it.style = Paint.Style.STROKE
            _canvas.drawRect(
                RectF(
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
        _path!!.close()
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
        _path!!.addCircle(x.toFloat(), y.toFloat(), radius.toFloat(), Path.Direction.CW)
        closePath()
        fill()
    }


    override fun strokeCircle(x: Double, y: Double, radius: Double) {
        beginPath()
        _path!!.addCircle(x.toFloat(), y.toFloat(), radius.toFloat(), Path.Direction.CW)
        closePath()
        stroke()
    }

    override fun fill() {
        createPaint().let {
            it.strokeWidth = 0f
            it.style = Paint.Style.FILL
            _canvas.drawPath(_path!!, it)
        }
        _path!!.reset()
    }

    override fun stroke() {
        createPaint().let {
            it.strokeWidth = lineWidth.toFloat()
            it.style = Paint.Style.STROKE
            _canvas.drawPath(_path!!, it)
        }
        _path!!.reset()
    }

    override fun beginGroup(identifier: String) {
    }

    override fun endGroup() {
    }

    override fun fillText(text: String, x: Double, y: Double) {
        textRun(typeFace, font.size * settings.display.scale, fun(paint) {
            paint.textAlign = when (textAlign) {
                TextAlign.Left -> Paint.Align.LEFT
                TextAlign.Center -> Paint.Align.CENTER
                TextAlign.Right -> Paint.Align.RIGHT
            }

            val fontBaseLine = getFontBaseLine(
                textBaseline,
                paint
            )

            _canvas.drawText(
                text,
                x.toFloat(),
                y.toFloat() + fontBaseLine,
                paint
            )
        })
    }

    private fun textRun(
        typeFace: Typeface,
        size: Double,
        action: (paint: Paint) -> Unit
    ) {
        val paint = createPaint()
        paint.style = Paint.Style.FILL

        paint.typeface = typeFace
        paint.textSize = size.toFloat()
        paint.isSubpixelText = true
        paint.hinting = Paint.HINTING_ON
        paint.isAntiAlias = true

        action(paint)
    }

    private fun getFontBaseLine(
        textBaseline: TextBaseline,
        paint: Paint
    ): Float {
        // https://github.com/chromium/chromium/blob/99314be8152e688bafbbf9a615536bdbb289ea87/third_party/blink/renderer/core/html/canvas/text_metrics.cc#L14
        return when (textBaseline) {
            TextBaseline.Top -> // kHangingTextBaseline
                -paint.fontMetrics.ascent * HangingAsPercentOfAscent / 100.0f
            TextBaseline.Middle -> {// kMiddleTextBaseline
                (-paint.fontMetrics.ascent - paint.fontMetrics.descent) / 2.0f
            }
            TextBaseline.Bottom -> {// kBottomTextBaseline
                -paint.fontMetrics.descent
            }
        }
    }


    override fun measureText(text: String): Double {
        if (text.isEmpty()) {
            return 0.0
        }
        var size = 0.0

        textRun(typeFace, font.size, fun(paint) {
            val bounds = Rect()
            paint.getTextBounds(text, 0, text.length, bounds)
            size = bounds.width().toDouble()
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
        fillMusicFontSymbols(x, y, scale, alphaTab.collections.List(symbol), centerAtPosition)
    }

    override fun fillMusicFontSymbols(
        x: Double,
        y: Double,
        scale: Double,
        symbols: alphaTab.collections.List<MusicFontSymbol>,
        centerAtPosition: Boolean?
    ) {
        val s = String(symbols
            .filter { it != MusicFontSymbol.None }
            .map<Char> { it.value.toChar() }
            .toCharArray()
        )

        textRun(MusicFont, MusicFontSize * scale, fun(paint) {
            if (centerAtPosition == true) {
                paint.textAlign = Paint.Align.CENTER
            }
            _canvas.drawText(
                s,
                x.toFloat(),
                y.toFloat(),
                paint
            )
        })
    }

    override fun beginRotate(centerX: Double, centerY: Double, angle: Double) {
        _canvas.save()
        _canvas.translate(centerX.toFloat(), centerY.toFloat())
        _canvas.rotate(angle.toFloat())
    }

    override fun endRotate() {
        _canvas.restore()
    }
}
