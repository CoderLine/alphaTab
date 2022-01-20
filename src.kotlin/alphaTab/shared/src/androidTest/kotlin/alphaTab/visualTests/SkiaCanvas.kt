package alphaTab.visualTests

import alphaTab.Settings
import alphaTab.core.ecmaScript.Uint8Array
import alphaTab.core.toCharArray
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
lateinit var MusicFont: Typeface
const val MusicFontSize = 34

const val HangingAsPercentOfAscent = 80

val CustomTypeFaces = HashMap<String, Typeface>();

// https://github.com/chromium/chromium/blob/99314be8152e688bafbbf9a615536bdbb289ea87/third_party/blink/renderer/modules/canvas/offscreencanvas2d/offscreen_canvas_rendering_context_2d.cc

@Suppress("RedundantSemicolon")
@ExperimentalUnsignedTypes
@ExperimentalContracts
public class SkiaCanvas : ICanvas {
    companion object {
        public fun initialize(bravura: Uint8Array) {
            val skData = Data.makeFromBytes(bravura.buffer.asByteArray())
            skData.use {
                val face = Typeface.makeFromData(skData)
                MusicFont = face
            }
        }

        public fun registerCustomFont(data: Uint8Array) {
            val skData = Data.makeFromBytes(data.buffer.asByteArray())
            skData.use {
                val face = Typeface.makeFromData(skData)
                CustomTypeFaces[customTypeFaceKey(face)] = face
            }
        }

        private fun customTypeFaceKey(typeface: Typeface): String {
            return customTypeFaceKey(typeface.familyName, typeface.isBold, typeface.isItalic)
        }

        private fun customTypeFaceKey(
            fontFamily: String,
            isBold: Boolean,
            isItalic: Boolean
        ): String {
            return fontFamily.lowercase() + "_" + isBold + "_" + isItalic;
        }

    }

    private lateinit var _surface: Surface
    private var _path: Path? = null
    private var _typeFaceCache: String = ""
    private var _typeFaceIsSystem: Boolean = false
    private var _typeFace: Typeface? = null

    public override var color: Color = Color(255.0, 255.0, 255.0)
    public override var lineWidth: Double = 1.0
    public override var font: Font = Font("Arial", 10.0)
    private val typeFace: Typeface
        get() {
            if (_typeFaceCache != font.toCssString(settings.display.scale)) {
                if (_typeFaceIsSystem) {
                    _typeFace?.close()
                }
                _typeFaceCache = font.toCssString(settings.display.scale)

                val key = customTypeFaceKey(font.family, font.isBold, font.isItalic)
                if(!CustomTypeFaces.containsKey(key)) {
                    _typeFaceIsSystem = true
                    _typeFace = Typeface.makeFromName(
                        font.family,
                        FontStyle(
                            if (font.isBold) FontStyle.BOLD.weight else FontStyle.NORMAL.weight,
                            FontStyle.NORMAL.width,
                            if (font.isItalic) FontStyle.ITALIC.slant else FontStyle.NORMAL.slant
                        )
                    )
                }
                else {
                    _typeFaceIsSystem = false
                    _typeFace = CustomTypeFaces[key]!!
                }

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
            it.setBlendMode(BlendMode.SRC_OVER)
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
            it.setBlendMode(BlendMode.SRC_OVER)
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
        textRun(text, typeFace, font.size, fun(blob, font, paint) {
            val xOffset = getFontOffset(
                textAlign,
                blob
            )

            val fontBaseLine = getFontBaseLine(
                textBaseline,
                font
            )

            _surface.canvas.drawTextBlob(
                blob,
                x.toFloat() + xOffset,
                y.toFloat() + fontBaseLine,
                paint
            )
        })
    }

    private fun textRun(
        text: String,
        typeFace: Typeface,
        size: Double,
        action: (blob: TextBlob, font: org.jetbrains.skija.Font, paint: Paint) -> Unit
    ) {
        val paint = createPaint()
        paint.mode = PaintMode.FILL

        paint.use {
            val shaper = Shaper.make()
            shaper.use {
                val font = Font(typeFace, (size * settings.display.scale).toFloat())
                font.edging = FontEdging.ANTI_ALIAS
                font.isSubpixel = true
                font.hinting = FontHinting.NORMAL
                val metrics = font.metrics
                // SkShaper seems to add a negative ascent to the Y-position, we have to correct this
                // https://source.chromium.org/chromium/chromium/src/+/master:third_party/skia/modules/skshaper/src/SkShaper.cpp;l=206;drc=c21c001893e2dd8229ab321465e4408798ff7289;bpv=1;bpt=1
                val yMetricsOffset = -metrics.ascent
                font.use {
                    val blob = shaper.shape(
                        text, font
                    )
                    blob?.use {
                        val blobBuilder = TextBlobBuilder()
                        val pos = arrayListOf<Point>()

                        for (i in blob.glyphs.indices) {
                            val xOffset = blob.positions[i * 2]
                            val yOffset = blob.positions[(i * 2) + 1] - yMetricsOffset
                            pos.add(Point(xOffset, yOffset))
                        }

                        blobBuilder.appendRunPos(font, blob.glyphs, pos.toTypedArray())

                        val skiaBlob = blobBuilder.build()
                        skiaBlob?.use {
                            action(skiaBlob, font, paint)
                        }
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
                floatAscent(font.metrics) * HangingAsPercentOfAscent / 100.0f
            TextBaseline.Middle -> {// kMiddleTextBaseline
                val (emHeightAscent, emHeightDescent) = normalizedTypoAscentDescent(font)
                (emHeightAscent - emHeightDescent) / 2.0f
            }
            TextBaseline.Bottom -> {// kBottomTextBaseline
                val (_, emHeightDescent) = normalizedTypoAscentDescent(font)
                -emHeightDescent
            }
        }
    }

    private fun normalizedTypoAscentDescent(font: org.jetbrains.skija.Font): Pair<Float, Float> {
        val typeface = font.typeface!!
        val (typoAscent, typeDecent) = typoAscenderDescender(typeface)
        if (typoAscent > 0) {
            val normalized = normalizeEmHeightMetrics(
                font,
                typoAscent.toFloat(),
                typeDecent.toFloat()
            )
            if (normalized != null) {
                return normalized
            }
        }

        val metrics = font.metrics
        val metricAscent = floatAscent(metrics)
        val metricDescent = floatDescent(metrics)
        val normalized = normalizeEmHeightMetrics(font, metricAscent, metricDescent)
        if (normalized != null) {
            return normalized
        }

        throw IllegalStateException("Cannot compute ascent and descent")
    }

    private fun normalizeEmHeightMetrics(
        font: org.jetbrains.skija.Font,
        ascent: Float,
        descent: Float
    ): Pair<Float, Float>? {
        val height = ascent + descent
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
            val ascender = getInt16(buffer.bytes, 68, false)
            val descender = -getInt16(buffer.bytes, 70, false)
            return Pair(ascender, descender.toShort())
        }

        return Pair(0.toShort(), 0.toShort())
    }

    private fun getInt16(src: ByteArray, pos: Int, littleEndian: Boolean): Short {
        return java.nio.ByteBuffer
            .wrap(src)
            .order(if (littleEndian) java.nio.ByteOrder.LITTLE_ENDIAN else java.nio.ByteOrder.BIG_ENDIAN)
            .getShort(pos)
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
        textRun(text, typeFace, font.size, fun(blob, _, _) {
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

        textRun(s, MusicFont, MusicFontSize * scale, fun(blob, _, paint) {
            val xOffset = getFontOffset(
                if (centerAtPosition == true) TextAlign.Center else TextAlign.Left,
                blob
            )
            _surface.canvas.drawTextBlob(
                blob,
                x.toFloat() + xOffset,
                y.toFloat(),
                paint
            )
        })
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
