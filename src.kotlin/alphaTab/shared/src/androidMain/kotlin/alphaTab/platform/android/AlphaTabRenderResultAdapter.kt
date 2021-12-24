package alphaTab.platform.android

import alphaTab.rendering.RenderFinishedEventArgs
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.view.ViewGroup
import android.widget.ImageView
import androidx.recyclerview.widget.RecyclerView
import com.google.android.flexbox.FlexboxLayoutManager
import java.util.concurrent.ConcurrentLinkedQueue
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
@ExperimentalUnsignedTypes
class AlphaTabRenderResultViewHolder(imageView: ImageView) : RecyclerView.ViewHolder(imageView) {
    private val _imageView: ImageView = imageView
    private var _decoded: Bitmap? = null

    fun bindTo(result: RenderFinishedEventArgs) {
        val data = result.renderResult
        _imageView.maxWidth = result.width.toInt()
        _imageView.maxHeight = result.height.toInt()
        _imageView.minimumWidth = result.width.toInt()
        _imageView.minimumHeight = result.height.toInt()
        if (data is Bitmap) {
            _imageView.setImageBitmap(data)
        } else if (data is ByteArray) {

            val newBitmap = BitmapFactory.decodeByteArray(data, 0, data.size)
            _imageView.setImageBitmap(newBitmap)

            _decoded?.recycle()
            _decoded = newBitmap
        }
    }
}

@ExperimentalContracts
@ExperimentalUnsignedTypes
class AlphaTabRenderResultAdapter : RecyclerView.Adapter<AlphaTabRenderResultViewHolder>() {
    private class Counter {
        public var count: Int = 0
    }

    private val _images: ArrayList<RenderFinishedEventArgs> = arrayListOf()
    private var totalResultCount: ConcurrentLinkedQueue<Counter> = ConcurrentLinkedQueue()
    fun reset() {
        totalResultCount.add(Counter())
    }

    public var totalWidth: Int = 0
    public var totalHeight: Int = 0

    public fun getImageInfo(position:Int) : RenderFinishedEventArgs {
        return _images[position]
    }

    fun finish() {
        val counter = totalResultCount.poll()
        if (counter != null) {
            // so we remove elements that might be from a previous render session
            while (_images.size > counter.count) {
                _images.removeLast()
            }
        }
    }

    fun addResult(result: RenderFinishedEventArgs) {
        totalWidth = result.totalWidth.toInt()
        totalHeight = result.totalHeight.toInt()

        val counter = totalResultCount.peek()
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
        val view = ImageView(parent.context)
        view.layoutParams = FlexboxLayoutManager.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ).apply {
            this.flexGrow = 0f
            this.flexShrink = 0f
        }
        return AlphaTabRenderResultViewHolder(view)
    }

    override fun onBindViewHolder(holder: AlphaTabRenderResultViewHolder, position: Int) {
        holder.bindTo(_images[position])
    }

    override fun onViewAttachedToWindow(holder: AlphaTabRenderResultViewHolder) {
        super.onViewAttachedToWindow(holder)
    }

    override fun getItemCount(): Int {
        return _images.size
    }
}
