package alphaTab.platform.android

import android.content.Context
import com.google.android.flexbox.*

class AlphaTabLayoutManager : FlexboxLayoutManager {
    private var _width: Int = 0

    constructor(context: Context?) :
        super(context, FlexDirection.ROW, FlexWrap.WRAP) {
        justifyContent = JustifyContent.FLEX_START
        alignItems = AlignItems.FLEX_START
    }

    override fun canScrollHorizontally(): Boolean {
        return true
    }

    override fun canScrollVertically(): Boolean {
        return true
    }

    override fun getWidth(): Int {
        return Math.max(_width, super.getWidth())
    }

    fun setWidth(value: Int) {
        _width = value
        requestLayout()
    }
}

//@ExperimentalUnsignedTypes
//@ExperimentalContracts
//class AlphaTabLayoutManager :
//    RecyclerView.LayoutManager,
//    RecyclerView.SmoothScroller.ScrollVectorProvider {
//
//    public class LayoutParams : RecyclerView.LayoutParams {
//        constructor(width: Int, height: Int) : super(width, height)
//        constructor(c: Context?, attrs: AttributeSet?) : super(c, attrs)
//    }
//
//    private class SavedState : Parcelable {
//        /** The adapter position of the first visible view  */
//        public var anchorPosition = 0
//
//        override fun describeContents(): Int {
//            return 0
//        }
//
//        override fun writeToParcel(dest: Parcel?, flags: Int) {
//            dest?.writeInt(anchorPosition)
//        }
//
//        constructor()
//        constructor(p: Parcel) {
//            anchorPosition = p.readInt()
//        }
//
//        constructor(s: SavedState) {
//            anchorPosition = s.anchorPosition
//        }
//
//        public fun invalidateAnchor() {
//            anchorPosition = RecyclerView.NO_POSITION
//        }
//
//        private fun hasValidAnchor(itemCount: Int): Boolean {
//            return anchorPosition >= 0 && anchorPosition < itemCount
//        }
//
//        companion object CREATOR : Creator<SavedState> {
//            override fun createFromParcel(parcel: Parcel): SavedState {
//                return SavedState(parcel)
//            }
//
//            override fun newArray(size: Int): Array<SavedState?> {
//                return arrayOfNulls(size)
//            }
//        }
//
//        override fun toString(): String {
//            return """SavedState{_anchorPosition=$anchorPosition, _anchorOffset=$anchorOffset}"""
//        }
//    }
//
//    private class AnchorInfo {
//        var position = 0
//        var valid = false
//
//        fun reset() {
//            position = RecyclerView.NO_POSITION
//            valid = false
//        }
//    }
//
//    private var _context: Context?
//    private val _uifacade: AndroidUiFacade
//    private var _isVertical: Boolean = true
//
//    private var _pendingSavedState: SavedState? = null
//    private val _anchorInfo = AnchorInfo()
//
//    /**
//     * The position to which the next layout should start from this adapter position.
//     * This value is set either from the [.mPendingSavedState] when a configuration change
//     * happens or programmatically such as when the [.scrollToPosition] is called.
//     */
//    private var _pendingScrollPosition = RecyclerView.NO_POSITION
//
//    /**
//     * The offset by which the next layout should be offset.
//     */
//    private var _pendingScrollPositionOffset = LinearLayoutManager.INVALID_OFFSET
//
//    constructor(context: Context?, uifacade: AndroidUiFacade) {
//        this._uifacade = uifacade
//        this._context = context
//
//        uifacade.settingsContainer.settingsChanged.on {
//            updateScrollDirection()
//        }
//        updateScrollDirection();
//    }
//
//    private fun updateScrollDirection() {
//        _isVertical =
//            alphaTab.Environment.getLayoutEngineFactory(_uifacade.settingsContainer.settings.display.layoutMode).vertical
//    }
//
//    override fun generateDefaultLayoutParams(): RecyclerView.LayoutParams {
//        return LayoutParams(
//            RecyclerView.LayoutParams.MATCH_PARENT,
//            RecyclerView.LayoutParams.MATCH_PARENT
//        )
//    }
//
//    override fun isAutoMeasureEnabled(): Boolean {
//        return true
//    }
//
//    override fun onDetachedFromWindow(view: RecyclerView?, recycler: RecyclerView.Recycler) {
//        super.onDetachedFromWindow(view, recycler)
//        removeAndRecycleAllViews(recycler)
//        recycler.clear()
//    }
//
//    override fun onInitializeAccessibilityEvent(event: AccessibilityEvent) {
//        super.onInitializeAccessibilityEvent(event)
//        if (childCount > 0) {
//            event.fromIndex = findFirstVisibleItemPosition()
//            event.toIndex = findLastVisibleItemPosition()
//        }
//    }
//
//    override fun onSaveInstanceState(): Parcelable? {
//        val pending = _pendingSavedState
//        if (pending != null) {
//            return SavedState(pending)
//        }
//        val savedState = SavedState()
//        if (childCount > 0) {
//            val firstView = getChildClosestToStart()
//            if (firstView != null) {
//                savedState.anchorPosition = getPosition(firstView)
//            }
//        } else {
//            savedState.invalidateAnchor()
//        }
//        return savedState
//    }
//
//    override fun onRestoreInstanceState(state: Parcelable?) {
//        if (state is SavedState) {
//            _pendingSavedState = state
//            if(_pendingScrollPosition != RecyclerView.NO_POSITION) {
//                state.invalidateAnchor()
//            }
//            requestLayout()
//        }
//    }
//
//    override fun canScrollHorizontally(): Boolean {
//        return true
//    }
//
//    override fun canScrollVertically(): Boolean {
//        return true
//    }
//
//    override fun findViewByPosition(position: Int): View? {
//        val childCount = childCount
//        if (childCount == 0) {
//            return null
//        }
//        val firstChild = getPosition(getChildAt(0)!!)
//        val viewPosition = position - firstChild
//        if (viewPosition in 0 until childCount) {
//            val child = getChildAt(viewPosition)
//            if (getPosition(child!!) == position) {
//                return child // in pre-layout, this may not match
//            }
//        }
//        // fallback to traversal. This might be necessary in pre-layout.
//        // fallback to traversal. This might be necessary in pre-layout.
//        return super.findViewByPosition(position)
//    }
//
//    override fun smoothScrollToPosition(
//        recyclerView: RecyclerView, state: RecyclerView.State?,
//        position: Int
//    ) {
//        val linearSmoothScroller = LinearSmoothScroller(recyclerView.context)
//        linearSmoothScroller.targetPosition = position
//        startSmoothScroll(linearSmoothScroller)
//    }
//
//    override fun computeScrollVectorForPosition(targetPosition: Int): PointF? {
//        if (childCount == 0) {
//            return null
//        }
//        val view = getChildAt(0) ?: return null
//        val firstChildPos = getPosition(view)
//        val direction = if (targetPosition < firstChildPos) -1 else 1
//        return if (_isVertical) {
//            PointF(0f, direction.toFloat())
//        } else {
//            PointF(direction.toFloat(), 0f)
//        }
//    }
//
//
//    override fun onLayoutChildren(recycler: RecyclerView.Recycler?, state: RecyclerView.State?) {
//        TODO()
//    }
//
//    override fun onLayoutCompleted(state: RecyclerView.State?) {
//        super.onLayoutCompleted(state)
//        _pendingSavedState = null
//        _pendingScrollPosition = RecyclerView.NO_POSITION
//        _pendingScrollPositionOffset = LinearLayoutManager.INVALID_OFFSET
//        _anchorInfo.reset()
//    }
//
//    override fun scrollToPosition(position: Int) {
//        _pendingScrollPosition = position
//        _pendingScrollPositionOffset = LinearLayoutManager.INVALID_OFFSET
//        _pendingSavedState?.invalidateAnchor()
//        requestLayout()
//    }
//
//    fun scrollToPositionWithOffset(position: Int, offset: Int) {
//        _pendingScrollPosition = position
//        _pendingScrollPositionOffset = offset
//        _pendingSavedState?.invalidateAnchor()
//        requestLayout()
//    }
//
//    override fun scrollHorizontallyBy(
//        dx: Int,
//        recycler: RecyclerView.Recycler?,
//        state: RecyclerView.State?
//    ): Int {
//        return scrollBy(dx, 0, recycler, state)
//    }
//
//    override fun scrollVerticallyBy(
//        dy: Int,
//        recycler: RecyclerView.Recycler?,
//        state: RecyclerView.State?
//    ): Int {
//        return scrollBy(0, dy, recycler, state)
//    }
//
//    override fun computeHorizontalScrollOffset(state: RecyclerView.State): Int {
//        return computeScrollOffset(state)
//    }
//
//    override fun computeVerticalScrollOffset(state: RecyclerView.State): Int {
//        return computeScrollOffset(state)
//    }
//
//    override fun computeHorizontalScrollExtent(state: RecyclerView.State): Int {
//        return computeScrollExtent(state)
//    }
//
//    override fun computeVerticalScrollExtent(state: RecyclerView.State): Int {
//        return computeScrollExtent(state)
//    }
//
//    override fun computeHorizontalScrollRange(state: RecyclerView.State): Int {
//        return computeScrollRange(state)
//    }
//
//    override  fun computeVerticalScrollRange(state: RecyclerView.State): Int {
//        return computeScrollRange(state)
//    }
//
//    private fun computeScrollOffset(state: RecyclerView.State): Int {
//        if (childCount == 0) {
//            return 0
//        }
//        return ScrollbarHelper.computeScrollOffset(
//            state, mOrientationHelper,
//            findFirstVisibleChildClosestToStart(!mSmoothScrollbarEnabled, true),
//            findFirstVisibleChildClosestToEnd(!mSmoothScrollbarEnabled, true),
//            this, mSmoothScrollbarEnabled, mShouldReverseLayout
//        )
//    }
//
//    private fun computeScrollExtent(state: RecyclerView.State): Int {
//        if (childCount == 0) {
//            return 0
//        }
//        ensureLayoutState()
//        return ScrollbarHelper.computeScrollExtent(
//            state, mOrientationHelper,
//            findFirstVisibleChildClosestToStart(!mSmoothScrollbarEnabled, true),
//            findFirstVisibleChildClosestToEnd(!mSmoothScrollbarEnabled, true),
//            this, mSmoothScrollbarEnabled
//        )
//    }
//
//    private fun computeScrollRange(state: RecyclerView.State): Int {
//        if (childCount == 0) {
//            return 0
//        }
//        ensureLayoutState()
//        return ScrollbarHelper.computeScrollRange(
//            state, mOrientationHelper,
//            findFirstVisibleChildClosestToStart(!mSmoothScrollbarEnabled, true),
//            findFirstVisibleChildClosestToEnd(!mSmoothScrollbarEnabled, true),
//            this, mSmoothScrollbarEnabled
//        )
//    }
//
//    override fun generateLayoutParams(
//        c: Context?,
//        attrs: AttributeSet?
//    ): RecyclerView.LayoutParams {
//        return LayoutParams(c, attrs)
//    }
//
//    override fun checkLayoutParams(lp: RecyclerView.LayoutParams?): Boolean {
//        return lp is LayoutParams
//    }
//
//    override fun onAdapterChanged(
//        oldAdapter: RecyclerView.Adapter<*>?,
//        newAdapter: RecyclerView.Adapter<*>?
//    ) {
//        removeAllViews()
//    }
//
//
//    private fun getChildClosestToStart(): View? {
//        // TODO: respect cursor items
//        return getChildAt(0)
//    }
//}
