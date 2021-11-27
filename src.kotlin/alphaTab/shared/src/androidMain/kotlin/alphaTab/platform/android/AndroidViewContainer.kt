package alphaTab.platform.android

import alphaTab.EventEmitter
import alphaTab.EventEmitterOfT
import alphaTab.IEventEmitter
import alphaTab.IEventEmitterOfT
import alphaTab.platform.IContainer
import alphaTab.platform.IMouseEventArgs
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.ScrollView
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
@ExperimentalUnsignedTypes
class AndroidViewContainer : IContainer, View.OnLayoutChangeListener, View.OnTouchListener {
    internal val _view: View

    public constructor(view: View) {
        _view = view
        _view.addOnLayoutChangeListener(this)
//        _view.setOnTouchListener(this)
    }

    override fun setBounds(x: Double, y: Double, w: Double, h: Double) {
        width = w
        height = h
    }

    override var width: Double
        get() = _view.measuredWidth.toDouble()
        set(value) {
            val params = _view.layoutParams
            if(params != null) {
                params.width = value.toInt()
            }
            _view.minimumWidth = value.toInt()
        }
    override var height: Double
        get() = _view.measuredHeight.toDouble()
        set(value) {
            val params = _view.layoutParams
            if(params != null) {
                params.height = value.toInt()
            }
            _view.minimumHeight = value.toInt()
        }
    override val isVisible: Boolean
        get() = _view.visibility == View.VISIBLE && _view.width > 0
    override var scrollLeft: Double
        get() = if (_view is ScrollView) _view.scrollX.toDouble() else 0.0
        set(value) {
            if (_view is ScrollView) _view.scrollX = value.toInt()
        }
    override var scrollTop: Double
        get() = if (_view is ScrollView) _view.scrollY.toDouble() else 0.0
        set(value) {
            if (_view is ScrollView) _view.scrollY = value.toInt()
        }

    override fun appendChild(child: IContainer) {
        // if (_view is ViewGroup) {
        //     val childView = (child as AndroidViewContainer)._view
        //     if (!_view.children.any { it == childView }) {
        //         _view.addView(childView)
        //     }
        // }
    }

    override fun stopAnimation() {
    }

    override fun transitionToX(duration: Double, x: Double) {
    }

    override fun clear() {
        if (_view is ViewGroup) {
            _view.removeAllViews()
        }
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
