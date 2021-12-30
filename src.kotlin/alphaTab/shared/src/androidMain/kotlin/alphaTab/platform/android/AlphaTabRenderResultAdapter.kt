package alphaTab.platform.android

import alphaTab.Environment
import alphaTab.collections.ObjectDoubleMap
import alphaTab.rendering.IScoreRenderer
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
class RenderResultDrawable(private val _requestRender: ((resultId: String) -> Unit)) : Drawable() {
    private val _alpha: Int = 255

    private var _currentResult: RenderFinishedEventArgs? = null
    private var _bitmap: Bitmap? = null

    private val _paint: Paint = Paint(Paint.FILTER_BITMAP_FLAG or Paint.DITHER_FLAG)
    private val _dstRect: Rect = Rect()

    private var _bitmapWidth: Int = 0
    private var _bitmapHeight: Int = 0
    private var _dstRectAndInsetsDirty = true

    public fun updateImage(result: RenderFinishedEventArgs) {
        val renderResult = result.renderResult
        if (renderResult is Bitmap) {
            _bitmap = renderResult
        } else {
            resetBitmap()
        }
        _bitmapWidth = (result.width * Environment.HighDpiFactor).toInt()
        _bitmapHeight = (result.height * Environment.HighDpiFactor).toInt()
        _currentResult = result
        _dstRectAndInsetsDirty = true
        invalidateSelf()
    }

    private fun updateDstRectIfDirty() {
        if (_dstRectAndInsetsDirty) {
            val bounds = bounds
            val layoutDirection = layoutDirection
            Gravity.apply(
                Gravity.TOP or Gravity.LEFT, _bitmapWidth, _bitmapHeight,
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
            if (!visible) {
                resetBitmap()
            }
        }
        return super.setVisible(visible, restart)
    }

    private fun requestRender() {
        val decoded = _bitmap
        val result = _currentResult
        if (decoded == null && result != null) {
            Log.i("AlphaTab", "Request image ${result.id} (${result.firstMasterBarIndex}-${result.lastMasterBarIndex})")
            _requestRender(result.id)
        }
    }

    private fun resetBitmap() {
        val decoded = _bitmap
        if (decoded != null) {
            decoded.recycle()
            _bitmap = null
            val result = _currentResult;
            if(result != null){
                Log.i("AlphaTab", "Recycled decoded image ${result.id} (${result.firstMasterBarIndex}-${result.lastMasterBarIndex})")
            }
        }
    }

    override fun draw(canvas: Canvas) {
        requestRender()
        updateDstRectIfDirty()

        val result = _currentResult;
        if(result != null) {
            val paint = Paint().apply {
                this.setARGB(255, 0, 255, 0)
                this.style = Paint.Style.FILL
                this.strokeWidth = 0f
            }
            canvas.drawRect(_dstRect, paint)

            paint.setARGB(255, 0, 0, 0)
            paint.style = Paint.Style.STROKE
            paint.strokeWidth = 3f
            canvas.drawRect(_dstRect, paint)

            paint.style = Paint.Style.FILL
            paint.textSize = 28f
            canvas.drawText("${result.x}/${result.y}, (${result.firstMasterBarIndex}-${result.lastMasterBarIndex}) ${result.id}", _dstRect.left + 50f, _dstRect.top + 50f, paint)
        }

        val bitmap = _bitmap
        if (bitmap != null && !bitmap.isRecycled) {
            try {
                canvas.drawBitmap(bitmap, null, _dstRect, _paint)
            } catch (e: RuntimeException) {
                // there can be a race on the bitmap recycling and usage.
            }
        }
    }
}

@ExperimentalContracts
@ExperimentalUnsignedTypes
class AlphaTabRenderResultViewHolder :
    RecyclerView.ViewHolder {
    constructor(context: Context, requestRender: ((resultId: String) -> Unit)) : super(
        ImageView(
            context
        )
    ) {
        val imageView = itemView as ImageView
        imageView.layoutParams = FlexboxLayoutManager.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ).apply {
            this.flexGrow = 0f
            this.flexShrink = 0f
        }
        imageView.setImageDrawable(RenderResultDrawable(requestRender))
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
class AlphaTabRenderResultAdapter(private val _requestRender: ((resultId: String) -> Unit)) :
    RecyclerView.Adapter<AlphaTabRenderResultViewHolder>() {
    private class Counter {
        public var count: Int = 0
    }

    private val _images: ArrayList<RenderFinishedEventArgs> = arrayListOf()
    private var _totalResultCount: ConcurrentLinkedQueue<Counter> = ConcurrentLinkedQueue()
    private val _resultIdToIndex: ObjectDoubleMap<String> = ObjectDoubleMap()
    private var _totalWidth: Int = 0
    private var _totalHeight: Int = 0

    public fun reset() {
        _totalResultCount.add(Counter())
        _resultIdToIndex.clear()
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
                _resultIdToIndex.set(result.id, counter.count.toDouble())
                notifyItemChanged(counter.count)
            } else {
                _images.add(result)
                _resultIdToIndex.set(result.id, (_images.size - 1).toDouble())
                notifyItemInserted(_images.size - 1)
            }
            counter.count++
        }
    }

    fun updateResult(result: RenderFinishedEventArgs) {
        if (_resultIdToIndex.has(result.id)) {
            val index = _resultIdToIndex.get(result.id);
            _images[index.toInt()] = result
            notifyItemChanged(index.toInt())
        }
    }

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int
    ): AlphaTabRenderResultViewHolder {

        return AlphaTabRenderResultViewHolder(parent.context, _requestRender)
    }

    override fun onBindViewHolder(holder: AlphaTabRenderResultViewHolder, position: Int) {
        holder.bindTo(_images[position])
    }

    override fun getItemCount(): Int {
        return _images.size
    }
}
