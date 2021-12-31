package alphaTab.platform.android

import alphaTab.*
import alphaTab.Environment
import alphaTab.EventEmitter
import alphaTab.EventEmitterOfT
import alphaTab.platform.IContainer
import alphaTab.platform.IMouseEventArgs
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.ScrollView
import androidx.recyclerview.widget.RecyclerView
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
@ExperimentalUnsignedTypes
class AndroidViewContainer : IContainer, View.OnLayoutChangeListener {
    internal val _view: View

    public constructor(view: View) {
        _view = view
        _view.addOnLayoutChangeListener(this)
    }

    override fun setBounds(x: Double, y: Double, w: Double, h: Double) {
        width = w
        height = h
    }

    override var width: Double
        get() = (_view.measuredWidth / Environment.HighDpiFactor)
        set(value) {
            val scaled = (value * Environment.HighDpiFactor).toInt()
            val params = _view.layoutParams
            if (params != null) {
                params.width = scaled
            }
            _view.minimumWidth = scaled
        }
    override var height: Double
        get() = _view.measuredHeight.toDouble()
        set(value) {
            val scaled = (value * Environment.HighDpiFactor).toInt()
            val params = _view.layoutParams
            if (params != null) {
                params.height = scaled
            }
            _view.minimumHeight = scaled
        }
    override val isVisible: Boolean
        get() = _view.visibility == View.VISIBLE && _view.width > 0
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
}
