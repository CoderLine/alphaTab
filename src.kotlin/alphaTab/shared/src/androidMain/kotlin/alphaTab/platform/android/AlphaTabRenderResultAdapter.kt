package alphaTab.platform.android

import alphaTab.Environment
import alphaTab.rendering.RenderFinishedEventArgs
import android.content.Context
import android.graphics.*
import android.graphics.drawable.Drawable
import android.util.Log
import android.view.Gravity
import android.view.ViewGroup
import android.widget.ImageView
import androidx.recyclerview.widget.RecyclerView
import com.google.android.flexbox.FlexboxLayoutManager
import java.util.concurrent.ConcurrentLinkedQueue
import kotlin.contracts.ExperimentalContracts

@ExperimentalUnsignedTypes
@ExperimentalContracts
class RenderResultDrawable : Drawable() {
    private val _alpha: Int = 255

    private var _encoded: ByteArray? = null
    private var _decodedBitmap: Bitmap? = null

    private val _paint: Paint = Paint(Paint.FILTER_BITMAP_FLAG or Paint.DITHER_FLAG)
    private val _dstRect: Rect = Rect()

    private var _bitmapWidth: Int = 0
    private var _bitmapHeight: Int = 0
    private var _dstRectAndInsetsDirty = true

    public fun updateImage(result: RenderFinishedEventArgs) {
        val renderResult = result.renderResult
        if (renderResult is ByteArray) {
            _encoded = renderResult
            _bitmapWidth = (result.width * Environment.HighDpiFactor).toInt()
            _bitmapHeight = (result.height * Environment.HighDpiFactor).toInt()
            resetDecoded()
        } else if (renderResult is Bitmap) {
            _encoded = null
            _decodedBitmap = renderResult
        }
        _dstRectAndInsetsDirty = true
        invalidateSelf()
    }

    private fun updateDstRectIfDirty() {
        if (_dstRectAndInsetsDirty) {
            val bounds = bounds
            val layoutDirection = layoutDirection
            Gravity.apply(
                Gravity.NO_GRAVITY, _bitmapWidth, _bitmapHeight,
                bounds, _dstRect, layoutDirection
            )
        }
        _dstRectAndInsetsDirty = false
    }

    override fun getIntrinsicWidth(): Int {
        return _bitmapWidth
    }

    override fun getIntrinsicHeight(): Int {
        return _bitmapHeight
    }

    override fun onBoundsChange(bounds: Rect?) {
        _dstRectAndInsetsDirty = true
    }

    override fun setAlpha(alpha: Int) {
        val oldAlpha = _alpha
        if (oldAlpha != alpha) {
            _paint.alpha = alpha
            invalidateSelf()
        }
    }

    override fun setColorFilter(colorFilter: ColorFilter?) {
        _paint.colorFilter = colorFilter
        invalidateSelf()
    }

    override fun getOpacity(): Int {
        return PixelFormat.TRANSLUCENT
    }

    override fun setVisible(visible: Boolean, restart: Boolean): Boolean {
        val changed = isVisible != visible
        if (changed) {
            if (visible) {
                ensureDecoded()
            } else {
                resetDecoded()
            }
        }
        return super.setVisible(visible, restart)
    }

    private fun ensureDecoded(): Bitmap? {
        var decoded = _decodedBitmap
        val encoded = _encoded
        if ((decoded == null || decoded.isRecycled) && encoded != null) {
            // TODO: try to decode in background and initiate redraw when loaded.
            decoded = BitmapFactory.decodeByteArray(encoded, 0, encoded.size)
            _decodedBitmap = decoded
            Log.i("AlphaTab", "Decoded image image")
        }
        return decoded
    }

    private fun resetDecoded() {
        val decoded = _decodedBitmap
        if(decoded != null){
            decoded.recycle()
            _decodedBitmap = null
            Log.i("AlphaTab", "Recycled decoded image")
        }
    }

    override fun draw(canvas: Canvas) {
        val decoded = ensureDecoded()
        updateDstRectIfDirty()
        if (decoded != null) {
            canvas.drawBitmap(_decodedBitmap!!, null, _dstRect, _paint)
        }
    }
}

@ExperimentalContracts
@ExperimentalUnsignedTypes
class AlphaTabRenderResultViewHolder :
    RecyclerView.ViewHolder {

    constructor(context: Context) : super(ImageView(context)) {
        val imageView = itemView as ImageView
        imageView.layoutParams = FlexboxLayoutManager.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ).apply {
            this.flexGrow = 0f
            this.flexShrink = 0f
        }
        imageView.setImageDrawable(RenderResultDrawable())
    }

    fun bindTo(result: RenderFinishedEventArgs) {
        val imageView = itemView as ImageView
        imageView.maxWidth = result.width.toInt()
        imageView.maxHeight = result.height.toInt()
        imageView.minimumWidth = result.width.toInt()
        imageView.minimumHeight = result.height.toInt()
        (imageView.drawable as RenderResultDrawable).updateImage(result)
    }
}

@ExperimentalContracts
@ExperimentalUnsignedTypes
class AlphaTabRenderResultAdapter : RecyclerView.Adapter<AlphaTabRenderResultViewHolder>() {
    private class Counter {
        public var count: Int = 0
    }

    private val _images: ArrayList<RenderFinishedEventArgs> = arrayListOf()
    private var _totalResultCount: ConcurrentLinkedQueue<Counter> = ConcurrentLinkedQueue()
    private var _totalWidth: Int = 0
    private var _totalHeight: Int = 0

    public fun reset() {
        _totalResultCount.add(Counter())
    }

    fun finish() {
        val counter = _totalResultCount.poll()
        if (counter != null) {
            // so we remove elements that might be from a previous render session
            while (_images.size > counter.count) {
                _images.removeLast()
            }
        }
    }

    fun addResult(result: RenderFinishedEventArgs) {
        _totalWidth = result.totalWidth.toInt()
        _totalHeight = result.totalHeight.toInt()

        val counter = _totalResultCount.peek()
        if (counter != null) {
            if (counter.count < _images.size) {
                _images[counter.count] = result
                notifyItemChanged(counter.count)
            } else {
                _images.add(result)
                notifyItemInserted(_images.size - 1)
            }
            counter.count++
        }
    }

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int
    ): AlphaTabRenderResultViewHolder {

        return AlphaTabRenderResultViewHolder(parent.context)
    }

    override fun onBindViewHolder(holder: AlphaTabRenderResultViewHolder, position: Int) {
        holder.bindTo(_images[position])
    }

    override fun getItemCount(): Int {
        return _images.size
    }
}
