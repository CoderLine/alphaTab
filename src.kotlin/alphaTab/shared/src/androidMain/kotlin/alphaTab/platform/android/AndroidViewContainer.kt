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
import android.view.animation.Animation
import android.view.animation.LinearInterpolator
import android.view.animation.Transformation
import android.widget.RelativeLayout
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
        val params = _view.layoutParams
        if (params is RelativeLayout.LayoutParams) {
            params.setMargins(
                (x * Environment.HighDpiFactor).toInt(),
                (y * Environment.HighDpiFactor).toInt(),
                0,
                0
            )
            params.width = (w * Environment.HighDpiFactor).toInt()
            params.height = (h * Environment.HighDpiFactor).toInt()
        }

        _view.requestLayout()
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
        val childView = (child as AndroidViewContainer)._view
        val group = _view
        if (group is ViewGroup) {
            group.addView(childView)
        }
    }


    override fun stopAnimation() {
        _view.clearAnimation()
    }

    override fun transitionToX(duration: Double, x: Double) {
        val params = _view.layoutParams as RelativeLayout.LayoutParams
        val startX = params.leftMargin
        val endX = x * Environment.HighDpiFactor;
        val a: Animation = object : Animation() {
            override fun applyTransformation(interpolatedTime: Float, t: Transformation?) {
                params.leftMargin = (startX + ((endX - startX) * interpolatedTime)).toInt()
                _view.requestLayout()
            }
        }
        a.interpolator = LinearInterpolator()
        a.duration = duration.toLong()
        _view.startAnimation(a)
    }

    override fun clear() {
        val group = _view
        if (group is ViewGroup) {
            group.removeAllViews()
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
}
