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
class AndroidRootViewContainer : IContainer, View.OnLayoutChangeListener {
    private val _outerScroll: HorizontalScrollView
    private val _innerScroll: ScrollView

    public constructor(outerScroll: HorizontalScrollView, innerScroll: ScrollView) {
        _innerScroll = innerScroll
        _outerScroll = outerScroll
        outerScroll.addOnLayoutChangeListener(this)
    }

    override fun setBounds(x: Double, y: Double, w: Double, h: Double) {
    }

    override var width: Double
        get() = (_outerScroll.measuredWidth / Environment.HighDpiFactor)
        set(value) {
        }
    override var height: Double
        get() = (_outerScroll.measuredHeight / Environment.HighDpiFactor)
        set(value) {
        }
    override val isVisible: Boolean
        get() = _outerScroll.visibility == View.VISIBLE

    override var scrollLeft: Double
        get() = _outerScroll.scrollX.toDouble()
        set(value) {
            _outerScroll.scrollX = value.toInt()
        }
    override var scrollTop: Double
        get() = _innerScroll.scrollY.toDouble()
        set(value) {
            _innerScroll.scrollY = value.toInt()
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
}