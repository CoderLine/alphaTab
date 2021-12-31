package alphaTab.platform.android

import alphaTab.Environment
import alphaTab.Logger
import alphaTab.collections.ObjectDoubleMap
import alphaTab.rendering.RenderFinishedEventArgs
import android.annotation.SuppressLint
import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View
import android.widget.HorizontalScrollView
import android.widget.ScrollView
import java.util.concurrent.ConcurrentLinkedQueue
import kotlin.contracts.ExperimentalContracts

@ExperimentalUnsignedTypes
@ExperimentalContracts
class AlphaTabRenderSurface(context: Context, attributeSet: AttributeSet) :
    View(context, attributeSet), View.OnScrollChangeListener {
    private val _results: ArrayList<RenderFinishedEventArgs> = arrayListOf()
    private val _resultIdToIndex: ObjectDoubleMap<String> = ObjectDoubleMap()

    private var _totalWidth: Int = 0
    private var _totalHeight: Int = 0

    public var requestRender: ((resultId: String) -> Unit)? = null

    public fun clearPlaceholders() {
        _resultIdToIndex.clear()
        _results.clear()
    }

    public fun trimPlaceholders() {
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        val verticalScroll = parent as ScrollView
        verticalScroll.setOnScrollChangeListener(this)
        val horizontalScroll = parent.parent as HorizontalScrollView
        horizontalScroll.setOnScrollChangeListener(this)

    }

    public fun addPlaceholder(result: RenderFinishedEventArgs) {
        _totalWidth = result.totalWidth.toInt()
        _totalHeight = result.totalHeight.toInt()
        _results.add(result)
        _resultIdToIndex.set(result.id, (_results.size - 1).toDouble())
        postInvalidate()
    }

    public fun fillPlaceholder(result: RenderFinishedEventArgs) {
        if (_resultIdToIndex.has(result.id)) {
            val index = _resultIdToIndex.get(result.id);
            _results[index.toInt()] = result
            postInvalidate()
        }
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        setMeasuredDimension(
            MeasureSpec.makeMeasureSpec(
                (_totalWidth * Environment.HighDpiFactor).toInt(),
                MeasureSpec.EXACTLY
            ),
            MeasureSpec.makeMeasureSpec(
                (_totalHeight * Environment.HighDpiFactor).toInt(),
                MeasureSpec.EXACTLY
            )
        );
    }

    private val _dstRect = RectF()
    private val _visibleRect = Rect()
    override fun onDraw(canvas: Canvas) {
        getLocalVisibleRect(_visibleRect)

        for (r in _results) {
            _dstRect.left = (r.x * Environment.HighDpiFactor).toFloat()
            _dstRect.top = (r.y * Environment.HighDpiFactor).toFloat()
            _dstRect.right = ((r.x + r.width) * Environment.HighDpiFactor).toFloat()
            _dstRect.bottom = ((r.y + r.height) * Environment.HighDpiFactor).toFloat()

            val result = r.renderResult

            if (_visibleRect.intersects(
                    _dstRect.left.toInt(),
                    _dstRect.top.toInt(),
                    _dstRect.right.toInt(),
                    _dstRect.bottom.toInt()
                )
            ) {
                if (result is Bitmap) {
                    canvas.drawBitmap(result, null, _dstRect, null)
                } else if (result == null) {
                    requestRender?.invoke(r.id)
                }
            } else if (result is Bitmap) {
                result.recycle()
                r.renderResult = null
            }
        }
    }

    override fun onScrollChange(
        v: View?,
        scrollX: Int,
        scrollY: Int,
        oldScrollX: Int,
        oldScrollY: Int
    ) {
        postInvalidateDelayed(20)
        // TODO we need to check whether a new partial actually became visible
        // only then redraw
    }
}
