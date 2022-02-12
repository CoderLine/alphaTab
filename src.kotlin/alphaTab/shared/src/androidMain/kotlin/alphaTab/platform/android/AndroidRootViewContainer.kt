package alphaTab.platform.android

import alphaTab.*
import alphaTab.platform.IContainer
import alphaTab.platform.IMouseEventArgs
import android.annotation.SuppressLint
import android.view.View
import android.widget.HorizontalScrollView
import android.widget.ScrollView
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
@ExperimentalUnsignedTypes
@SuppressLint("ClickableViewAccessibility")
internal class AndroidRootViewContainer : IContainer, View.OnLayoutChangeListener {
    private val _outerScroll: HorizontalScrollView
    private val _innerScroll: ScrollView
    internal val renderSurface: AlphaTabRenderSurface

    public constructor(
        outerScroll: HorizontalScrollView,
        innerScroll: ScrollView,
        renderSurface: AlphaTabRenderSurface
    ) {
        _innerScroll = innerScroll
        _outerScroll = outerScroll
        this.renderSurface = renderSurface
        outerScroll.addOnLayoutChangeListener(this)
    }

    fun destroy() {
        _outerScroll.removeOnLayoutChangeListener(this)
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

    fun scrollToX(offset: Double) {
        _outerScroll.smoothScrollTo(
            (offset * Environment.HighDpiFactor).toInt(),
            _outerScroll.scrollY
        )
    }

    fun scrollToY(offset: Double) {
        _innerScroll.smoothScrollTo(
            _innerScroll.scrollX,
            (offset * Environment.HighDpiFactor).toInt()
        )
    }
}
