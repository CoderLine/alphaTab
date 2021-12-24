package alphaTab.platform.android

import android.content.Context
import android.graphics.Point
import android.graphics.PointF
import android.util.AttributeSet
import android.util.Log
import android.view.View
import androidx.recyclerview.widget.LinearSmoothScroller
import androidx.recyclerview.widget.RecyclerView
import kotlin.contracts.ExperimentalContracts

@ExperimentalUnsignedTypes
@ExperimentalContracts
class AlphaTabLayoutManager :
    RecyclerView.LayoutManager,
    RecyclerView.SmoothScroller.ScrollVectorProvider {

    private var _recyclerView: RecyclerView? = null
    private var _context: Context?
    private val _uifacade: AndroidUiFacade
    private var _isVertical: Boolean = true
    private var _scrollOffsetX = 0
    private var _scrollOffsetY = 0

    private var _pendingScrollPosition = RecyclerView.NO_POSITION

    private var _adapter: AlphaTabRenderResultAdapter? = null

    constructor(
        context: Context?,
        uifacade: AndroidUiFacade
    ) {
        this._uifacade = uifacade
        this._context = context

        uifacade.settingsContainer.settingsChanged.on {
            updateScrollDirection()
        }
        updateScrollDirection();
    }

    override fun onAttachedToWindow(view: RecyclerView?) {
        _recyclerView = view
        _adapter = view?.adapter as AlphaTabRenderResultAdapter?
        super.onAttachedToWindow(view)
    }

    private fun updateScrollDirection() {
        _isVertical =
            alphaTab.Environment.getLayoutEngineFactory(_uifacade.settingsContainer.settings.display.layoutMode).vertical
    }

    override fun isAutoMeasureEnabled(): Boolean {
        return true
    }

    override fun onDetachedFromWindow(view: RecyclerView?, recycler: RecyclerView.Recycler) {
        super.onDetachedFromWindow(view, recycler)
        removeAndRecycleAllViews(recycler)
        recycler.clear()
    }

    override fun canScrollHorizontally(): Boolean {
        return true
    }

    override fun canScrollVertically(): Boolean {
        return true
    }

    override fun findViewByPosition(position: Int): View? {
        val childCount = childCount
        if (childCount == 0) {
            return null
        }
        val firstChild = getPosition(getChildAt(0)!!)
        val viewPosition = position - firstChild
        if (viewPosition in 0 until childCount) {
            val child = getChildAt(viewPosition)
            if (getPosition(child!!) == position) {
                return child // in pre-layout, this may not match
            }
        }
        // fallback to traversal. This might be necessary in pre-layout.
        return super.findViewByPosition(position)
    }

    override fun smoothScrollToPosition(
        recyclerView: RecyclerView, state: RecyclerView.State?,
        position: Int
    ) {
        val linearSmoothScroller = LinearSmoothScroller(recyclerView.context)
        linearSmoothScroller.targetPosition = position
        startSmoothScroll(linearSmoothScroller)
    }

    override fun computeScrollVectorForPosition(targetPosition: Int): PointF? {
        if (childCount == 0) {
            return null
        }
        val view = getChildAt(0) ?: return null
        val firstChildPos = getPosition(view)
        val direction = if (targetPosition < firstChildPos) -1 else 1
        return if (_isVertical) {
            PointF(0f, direction.toFloat())
        } else {
            PointF(direction.toFloat(), 0f)
        }
    }


    override fun onLayoutChildren(recycler: RecyclerView.Recycler, state: RecyclerView.State) {
        detachAndScrapAttachedViews(recycler)
        if (state.itemCount == 0 || state.isPreLayout) {
            return;
        }

        val recyclerView = _recyclerView
        val adapter = _adapter
        if (recyclerView == null || adapter == null) {
            return
        }

        var x = recyclerView.paddingLeft
        var y = recyclerView.paddingTop

        val maxX = adapter.totalWidth

        var currentItemPosition = 0
        while (currentItemPosition < state.itemCount) {
            val item = adapter.getImageInfo(currentItemPosition)
            val child = recycler.getViewForPosition(currentItemPosition)
            if (isItemVisible(x, y, item.width.toInt(), item.height.toInt())) {
                addView(child)
                layoutDecorated(child, x, y, (x + item.width).toInt(), (y + item.height).toInt());
            } else {
                recycler.recycleView(child)
            }

            x += item.width.toInt()
            if (x >= maxX) {
                x = recyclerView.paddingLeft
                y += item.height.toInt()
            }

            currentItemPosition++
        }
    }

    private fun isItemVisible(x: Int, y: Int, toInt: Int, toInt1: Int): Boolean {
        return true // TODO
    }

    private fun fill(recycler: RecyclerView.Recycler, state: RecyclerView.State) {


        TODO("Not yet implemented")
    }

    override fun onLayoutCompleted(state: RecyclerView.State?) {
        super.onLayoutCompleted(state)
        _pendingScrollPosition = RecyclerView.NO_POSITION
    }

    override fun scrollToPosition(position: Int) {
        _pendingScrollPosition = position
        requestLayout()
    }

    override fun scrollHorizontallyBy(
        dx: Int,
        recycler: RecyclerView.Recycler,
        state: RecyclerView.State
    ): Int {
        Log.i("AlphaTab", "Horizontal Scroll $dx")
        var newScroll = _scrollOffsetX - dx
        if(newScroll < 0) {
            newScroll = 0
        }
        else {
            val max = computeHorizontalScrollRange(state)
            if(newScroll > max) {
                newScroll = max
            }
        }

        val scrolled = newScroll - _scrollOffsetX
        _scrollOffsetX = newScroll
        offsetChildrenHorizontal(scrolled)

        return scrolled
    }

    override fun scrollVerticallyBy(
        dy: Int,
        recycler: RecyclerView.Recycler,
        state: RecyclerView.State
    ): Int {
        Log.i("AlphaTab", "Vertical Scroll $dy")
        var newScroll = _scrollOffsetY - dy
        if(newScroll < 0) {
            newScroll = 0
        }
        else {
            val max = computeVerticalScrollRange(state)
            if(newScroll > max) {
                newScroll = max
            }
        }

        val scrolled = newScroll - _scrollOffsetY
        _scrollOffsetY = newScroll
        offsetChildrenVertical(scrolled)

        return scrolled
    }

    override fun computeHorizontalScrollOffset(state: RecyclerView.State): Int {
        return _scrollOffsetX;
    }

    override fun computeVerticalScrollOffset(state: RecyclerView.State): Int {
        return _scrollOffsetY;
    }

    override fun computeHorizontalScrollExtent(state: RecyclerView.State): Int {
        return _adapter?.totalWidth ?: 0
    }

    override fun computeVerticalScrollExtent(state: RecyclerView.State): Int {
        return _adapter?.totalHeight ?: 0
    }

    override fun computeHorizontalScrollRange(state: RecyclerView.State): Int {
        return _adapter?.totalWidth ?: 0
    }

    override fun computeVerticalScrollRange(state: RecyclerView.State): Int {
        return _adapter?.totalHeight ?: 0
    }

    override fun generateDefaultLayoutParams(): RecyclerView.LayoutParams {
        return RecyclerView.LayoutParams(
            RecyclerView.LayoutParams.WRAP_CONTENT,
            RecyclerView.LayoutParams.WRAP_CONTENT
        )
    }

    override fun generateLayoutParams(
        c: Context?,
        attrs: AttributeSet?
    ): RecyclerView.LayoutParams {
        return RecyclerView.LayoutParams(c, attrs)
    }

    override fun onAdapterChanged(
        oldAdapter: RecyclerView.Adapter<*>?,
        newAdapter: RecyclerView.Adapter<*>?
    ) {
        _adapter = newAdapter as AlphaTabRenderResultAdapter
        removeAllViews()
    }
}
