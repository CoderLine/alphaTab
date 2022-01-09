package alphaTab.platform.android

import alphaTab.*
import alphaTab.platform.IContainer
import alphaTab.platform.IMouseEventArgs
import android.annotation.SuppressLint
import android.os.Handler
import android.util.Log
import android.view.*
import android.view.animation.Animation
import android.view.animation.LinearInterpolator
import android.view.animation.Transformation
import android.widget.RelativeLayout
import kotlin.contracts.ExperimentalContracts
import kotlin.math.abs

@ExperimentalContracts
@ExperimentalUnsignedTypes
@SuppressLint("ClickableViewAccessibility")
internal class AndroidViewContainer : GestureDetector.SimpleOnGestureListener, IContainer,
    View.OnLayoutChangeListener, View.OnTouchListener {
    internal val view: View
    private var _horizontalScrollView: SuspendableHorizontalScrollView? = null
    private var _verticalScrollView: SuspendableScrollView? = null
    private var _gestureDetector: GestureDetector? = null

    public constructor(view: View) {
        this.view = view
        this.view.addOnLayoutChangeListener(this)
    }

    public fun enableUserInteraction(
        horizontalScrollView: SuspendableHorizontalScrollView,
        verticalScrollView: SuspendableScrollView
    ) {
        _gestureDetector = GestureDetector(view.context!!, this)
        view.setOnTouchListener(this)
        _horizontalScrollView = horizontalScrollView
        _verticalScrollView = verticalScrollView
    }

    fun destroy() {
        this.view.removeOnLayoutChangeListener(this)
        this.view.setOnTouchListener(null)
    }


    private var _isLongDown = false
    override fun onLongPress(e: MotionEvent) {
        Log.d("AlphaTab", "Long down ${e.rawX} ${e.rawY}")
        _isLongDown = true
        _horizontalScrollView!!.isUserScrollingEnabled = false
        _verticalScrollView!!.isUserScrollingEnabled = false
        (mouseDown as EventEmitterOfT<IMouseEventArgs>).trigger(AndroidMouseEventArgs(e))
    }

    override fun onSingleTapConfirmed(e: MotionEvent): Boolean {
        val down = AndroidMouseEventArgs(e)
        (mouseDown as EventEmitterOfT<IMouseEventArgs>).trigger(down)

        return if (down.defaultPrevented) {
            val up = AndroidMouseEventArgs(e)
            (mouseUp as EventEmitterOfT<IMouseEventArgs>).trigger(up)

            true
        } else {
            false
        }
    }

    override fun onTouch(v: View, event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_MOVE -> {
                if (_isLongDown) {
                    val args = AndroidMouseEventArgs(event)
                    (this.mouseMove as EventEmitterOfT<IMouseEventArgs>).trigger(args)
                }
            }
            MotionEvent.ACTION_UP -> {
                _horizontalScrollView!!.isUserScrollingEnabled = true
                _verticalScrollView!!.isUserScrollingEnabled = true

                if (_isLongDown) { // was long press -> raise mouse up
                    _isLongDown = false
                    val args = AndroidMouseEventArgs(event)
                    (this.mouseUp as EventEmitterOfT<IMouseEventArgs>).trigger(args)
                }
            }
        }

        _gestureDetector!!.onTouchEvent(event)
        return true
    }

    override fun setBounds(x: Double, y: Double, w: Double, h: Double) {
        val params = view.layoutParams
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

        view.requestLayout()
    }

    override var width: Double
        get() = (view.measuredWidth / Environment.HighDpiFactor)
        set(value) {
            val scaled = (value * Environment.HighDpiFactor).toInt()
            val params = view.layoutParams
            if (params != null) {
                params.width = scaled
            }
            view.minimumWidth = scaled
        }
    override var height: Double
        get() = view.measuredHeight.toDouble()
        set(value) {
            val scaled = (value * Environment.HighDpiFactor).toInt()
            val params = view.layoutParams
            if (params != null) {
                params.height = scaled
            }
            view.minimumHeight = scaled
        }
    override val isVisible: Boolean
        get() = view.visibility == View.VISIBLE && view.width > 0
    override var scrollLeft: Double
        get() = 0.0
        set(value) {
        }
    override var scrollTop: Double
        get() = 0.0
        set(value) {
        }

    override fun appendChild(child: IContainer) {
        val childView = (child as AndroidViewContainer).view
        val group = view
        if (group is ViewGroup) {
            group.addView(childView)
        }
    }

    override fun stopAnimation() {
        view.clearAnimation()
    }

    override fun transitionToX(duration: Double, x: Double) {
        val params = view.layoutParams as RelativeLayout.LayoutParams
        val startX = params.leftMargin
        val endX = x * Environment.HighDpiFactor
        val a: Animation = object : Animation() {
            override fun applyTransformation(interpolatedTime: Float, t: Transformation?) {
                params.leftMargin = (startX + ((endX - startX) * interpolatedTime)).toInt()
                view.requestLayout()
            }
        }
        a.interpolator = LinearInterpolator()
        a.duration = duration.toLong()
        view.startAnimation(a)
    }

    override fun clear() {
        val group = view
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
