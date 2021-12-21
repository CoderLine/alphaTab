package alphaTab.platform.android

import alphaTab.*
import alphaTab.Environment
import alphaTab.EventEmitter
import alphaTab.EventEmitterOfT
import alphaTab.platform.IContainer
import alphaTab.platform.IMouseEventArgs
import android.view.MotionEvent
import android.view.View
import android.widget.HorizontalScrollView
import android.widget.ScrollView
import androidx.core.view.children
import androidx.recyclerview.widget.RecyclerView
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
@ExperimentalUnsignedTypes
class AndroidRootViewContainer : IContainer, View.OnLayoutChangeListener, View.OnTouchListener {
    private val _screenSizeView: View
    private val _mainContentView: RecyclerView

    public constructor(
        screenSizeView: View,
        mainContentView: RecyclerView
    ) {
        _screenSizeView = screenSizeView
        _mainContentView = mainContentView
        screenSizeView.addOnLayoutChangeListener(this)
    }

    override fun setBounds(x: Double, y: Double, w: Double, h: Double) {
        width = w
        height = h
    }

    override var width: Double
        get() = (_screenSizeView.measuredWidth / Environment.HighDpiFactor)
        set(value) {
        }
    override var height: Double
        get() = (_screenSizeView.measuredHeight / Environment.HighDpiFactor)
        set(value) {
        }
    override val isVisible: Boolean
        get() = _screenSizeView.visibility == View.VISIBLE

    override var scrollLeft: Double
        get() = 0.0
        set(value) {
        }
    override var scrollTop: Double
        get() = 0.0
        set(value) {
        }

    override fun appendChild(child: IContainer) {

    }

    override fun stopAnimation() {
    }

    override fun transitionToX(duration: Double, x: Double) {
    }

    override fun clear() {
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
