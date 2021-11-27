package alphaTab.platform.android

import alphaTab.EventEmitter
import alphaTab.EventEmitterOfT
import alphaTab.IEventEmitter
import alphaTab.IEventEmitterOfT
import alphaTab.platform.IContainer
import alphaTab.platform.IMouseEventArgs
import android.view.MotionEvent
import android.view.View
import android.widget.HorizontalScrollView
import android.widget.ScrollView
import androidx.core.view.children
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
@ExperimentalUnsignedTypes
class AndroidRootViewContainer : IContainer, View.OnLayoutChangeListener, View.OnTouchListener {
    private val _innerVerticalScrollView: ScrollView
    private val _outerHorizontalScrollView: HorizontalScrollView

    public constructor(innerVerticalScrollView: ScrollView,
                       outerHorizontalScrollView: HorizontalScrollView) {
        _innerVerticalScrollView = innerVerticalScrollView
        _outerHorizontalScrollView = outerHorizontalScrollView
        _outerHorizontalScrollView.addOnLayoutChangeListener(this)
//        _view.setOnTouchListener(this)
    }

    override fun setBounds(x: Double, y: Double, w: Double, h: Double) {
        width = w
        height = h
    }

    override var width: Double
        get() = _outerHorizontalScrollView.measuredWidth.toDouble()
        set(value) {
            _outerHorizontalScrollView.minimumWidth = value.toInt()
        }
    override var height: Double
        get() = _outerHorizontalScrollView.measuredHeight.toDouble()
        set(value) {
            _outerHorizontalScrollView.minimumHeight = value.toInt()
        }
    override val isVisible: Boolean
        get() = _outerHorizontalScrollView.visibility == View.VISIBLE && _outerHorizontalScrollView.width > 0
    override var scrollLeft: Double
        get() = _outerHorizontalScrollView.scrollX.toDouble()
        set(value) {
            _outerHorizontalScrollView.scrollX = value.toInt()
        }
    override var scrollTop: Double
        get() = _innerVerticalScrollView.scrollY.toDouble()
        set(value) {
            _innerVerticalScrollView.scrollY = value.toInt()
        }

    override fun appendChild(child: IContainer) {
        val childView = (child as AndroidViewContainer)._view
        if (!_innerVerticalScrollView.children.any { it == childView }) {
            _innerVerticalScrollView.addView(childView)
        }
    }

    override fun stopAnimation() {
    }

    override fun transitionToX(duration: Double, x: Double) {
    }

    override fun clear() {
        _innerVerticalScrollView.removeAllViews()
    }

    override var resize: IEventEmitter = EventEmitter()
    override var mouseDown: IEventEmitterOfT<IMouseEventArgs> = EventEmitterOfT()
    override var mouseMove: IEventEmitterOfT<IMouseEventArgs> = EventEmitterOfT()
    override var mouseUp: IEventEmitterOfT<IMouseEventArgs> = EventEmitterOfT()

    override fun onLayoutChange(
        v: View?,
        left: Int,
        top: Int,
        right: Int,
        bottom: Int,
        oldLeft: Int,
        oldTop: Int,
        oldRight: Int,
        oldBottom: Int
    ) {
        val widthChanged = (right - left) != (oldRight - oldLeft)
        val heightChanged = (bottom - top) != (oldTop - oldBottom)
        if (widthChanged || heightChanged) {
            (resize as EventEmitter).trigger()
        }
    }

    override fun onTouch(v: View?, event: MotionEvent?): Boolean {
        if (event == null) {
            return true
        }
        // TODO: Decide on interactivity
//        when(event.action) {
//           MotionEvent.ACTION_DOWN ->
//               (mouseDown as EventEmitter).trigger()
//            MotionEvent.ACTION_UP ->
//                (mouseUp as EventEmitterOfT).trigger(map)
//        }
        return true
    }
}
