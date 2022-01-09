package alphaTab.platform.android

import alphaTab.Environment
import alphaTab.collections.ObjectDoubleMap
import alphaTab.rendering.RenderFinishedEventArgs
import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View
import android.widget.HorizontalScrollView
import android.widget.ScrollView
import java.io.Closeable
import java.lang.RuntimeException
import kotlin.contracts.ExperimentalContracts

@ExperimentalUnsignedTypes
@ExperimentalContracts
internal class RenderPlaceholder(public var result: RenderFinishedEventArgs) : Closeable {
    companion object {
        const val STATE_LAYOUT_DONE = 0
        const val STATE_RENDER_REQUESTED = 1
        const val STATE_RENDER_DONE = 2
    }

    public var state: Int = STATE_LAYOUT_DONE
    public var isVisible: Boolean = false
    public var drawingRect: RectF = RectF(
        (result.x * Environment.HighDpiFactor).toFloat(),
        (result.y * Environment.HighDpiFactor).toFloat(),
        ((result.x + result.width) * Environment.HighDpiFactor).toFloat(),
        ((result.y + result.height) * Environment.HighDpiFactor).toFloat()
    )

    override fun close() {
        val b = result.renderResult
        if (b is Bitmap) {
            b.recycle()
            result.renderResult = null
        }
    }
}

@ExperimentalUnsignedTypes
@ExperimentalContracts
internal class AlphaTabRenderSurface(context: Context, attributeSet: AttributeSet) :
    View(context, attributeSet), View.OnScrollChangeListener {
    private val _placeholders: ArrayList<RenderPlaceholder> = arrayListOf()
    private val _resultIdToIndex: ObjectDoubleMap<String> = ObjectDoubleMap()

    private var _totalWidth: Int = 0
    private var _totalHeight: Int = 0

    private val _visibleRect = Rect()
    private val _visibleAfterScrollRect = Rect()
    private var _layoutDirty = true
    private var _visibleRectDirty = true

    // remember items which are shown at each edge of the screen
    private var _topVisibleItem: RenderPlaceholder? = null
    private var _bottomVisibleItem: RenderPlaceholder? = null
    private var _leftVisibleItem: RenderPlaceholder? = null
    private var _rightVisibleItem: RenderPlaceholder? = null

    public var requestRender: ((resultId: String) -> Unit)? = null

    public fun clearPlaceholders() {
        _resultIdToIndex.clear()
        val placeholder = _placeholders
        for (p in placeholder) {
            p.close();
        }
        placeholder.clear()
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        val verticalScroll = parent.parent as ScrollView
        verticalScroll.setOnScrollChangeListener(this)
        val horizontalScroll = parent.parent.parent as HorizontalScrollView
        horizontalScroll.setOnScrollChangeListener(this)
        _visibleRectDirty = true
    }

    public fun addPlaceholder(result: RenderFinishedEventArgs) {
        _totalWidth = result.totalWidth.toInt()
        _totalHeight = result.totalHeight.toInt()
        _placeholders.add(RenderPlaceholder(result))
        _resultIdToIndex.set(result.id, (_placeholders.size - 1).toDouble())
        _layoutDirty = true
        requestLayout()
        postInvalidate()
    }

    public fun fillPlaceholder(result: RenderFinishedEventArgs) {
        if (_resultIdToIndex.has(result.id)) {
            val index = _resultIdToIndex.get(result.id);
            _placeholders[index.toInt()].apply {
                this.result = result
                this.state = RenderPlaceholder.STATE_RENDER_DONE
                this.isVisible = true
            }
            _layoutDirty = true
            requestLayout()
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
        )
        _visibleRectDirty = true;
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        updateVisibleRect()

        var topItem: RenderPlaceholder? = null
        var bottomItem: RenderPlaceholder? = null
        var leftItem: RenderPlaceholder? = null
        var rightItem: RenderPlaceholder? = null

        for (p in _placeholders) {
            val r = p.result

            val result = r.renderResult

            if (_visibleRect.intersects(
                    p.drawingRect.left.toInt(),
                    p.drawingRect.top.toInt(),
                    p.drawingRect.right.toInt(),
                    p.drawingRect.bottom.toInt()
                )
            ) {
                // remember which items are on each edge of the screen
                // to optimize the checks during scroll if a new item became likely visible
                if (topItem == null || (p.drawingRect.top < topItem.drawingRect.top)) {
                    topItem = p
                }
                if (bottomItem == null || (p.drawingRect.bottom > bottomItem.drawingRect.bottom)) {
                    bottomItem = p
                }
                if (leftItem == null || (p.drawingRect.left < leftItem.drawingRect.left)) {
                    leftItem = p
                }
                if (rightItem == null || (p.drawingRect.right > rightItem.drawingRect.right)) {
                    rightItem = p
                }

                if (result == null && p.state != RenderPlaceholder.STATE_RENDER_REQUESTED) {
                    p.state = RenderPlaceholder.STATE_RENDER_REQUESTED
                    requestRender?.invoke(r.id)
                }
            } else if (result is Bitmap) {
                p.isVisible = false
                p.state = RenderPlaceholder.STATE_LAYOUT_DONE
                result.recycle()
                r.renderResult = null
            }
        }

        _topVisibleItem = topItem
        _bottomVisibleItem = bottomItem
        _leftVisibleItem = leftItem
        _rightVisibleItem = rightItem
        _layoutDirty = false
    }

    private fun updateVisibleRect() {
        if (_visibleRectDirty) {
            getLocalVisibleRect(_visibleRect)
            _visibleAfterScrollRect.set(_visibleRect)
        }
        _visibleRectDirty = false
    }

    override fun onDraw(canvas: Canvas) {
        for (p in _placeholders) {
            val r = p.result
            val result = r.renderResult
            if (p.isVisible && result is Bitmap && !result.isRecycled) {
                try {
                    canvas.drawBitmap(result, null, p.drawingRect, null)
                } catch (e: RuntimeException) {
                    // potential race on bitmap recycle
                }
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
        if(!_layoutDirty) {
            var anyVisibleItemExceeded = false

            val horizontalScroll = scrollX - oldScrollX
            val verticalScroll = scrollY - oldScrollY
            _visibleAfterScrollRect.offset(horizontalScroll, verticalScroll)

            val topItem = _topVisibleItem
            if (topItem == null) { // no items yet -> do layout
                anyVisibleItemExceeded = true
            } else {
                val bottomItem = _bottomVisibleItem!!
                val leftItem = _leftVisibleItem!!
                val rightItem = _rightVisibleItem!!

                if (horizontalScroll > 0) {
                    // scrolling to right (screen goes left)
                    if (_visibleAfterScrollRect.right > rightItem.drawingRect.right) {
                        anyVisibleItemExceeded = true
                    }
                } else if (horizontalScroll < 0) {
                    // scrolling to left (scren goes right)
                    if (_visibleAfterScrollRect.left < leftItem.drawingRect.left) {
                        anyVisibleItemExceeded = true
                    }
                }

                if (verticalScroll > 0) {
                    // scrolling down (screen goes up)
                    if (_visibleAfterScrollRect.bottom > bottomItem.drawingRect.bottom) {
                        anyVisibleItemExceeded = true
                    }
                } else if (verticalScroll < 0) {
                    // scrolling up (screen goes down)
                    if (_visibleAfterScrollRect.top < bottomItem.drawingRect.top) {
                        anyVisibleItemExceeded = true
                    }
                }
            }

            if (anyVisibleItemExceeded) {
                _layoutDirty = true
                requestLayout()
                postInvalidate()
            }
        }
    }
}
