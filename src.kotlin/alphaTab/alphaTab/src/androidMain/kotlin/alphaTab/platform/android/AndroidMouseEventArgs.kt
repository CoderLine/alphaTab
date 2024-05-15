package alphaTab.platform.android

import alphaTab.Environment
import alphaTab.platform.IContainer
import alphaTab.platform.IMouseEventArgs
import android.view.MotionEvent
import android.view.View
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
@ExperimentalUnsignedTypes
internal class AndroidMouseEventArgs(
    private val _event: MotionEvent
) : IMouseEventArgs {
    private var _defaultPrevented = false
    public val defaultPrevented: Boolean get() = _defaultPrevented

    override val isLeftMouseButton: Boolean
        get() = true

    override fun getX(relativeTo: IContainer): Double {
        val location = IntArray(2)
        if (relativeTo is AndroidRootViewContainer) {
            relativeTo.renderSurface.getLocationOnScreen(location)
        } else if (relativeTo is AndroidViewContainer) {
            relativeTo.view.getLocationOnScreen(location)
        }

        return (_event.rawX - location[0]) / Environment.HighDpiFactor
    }

    override fun getY(relativeTo: IContainer): Double {val location = IntArray(2)
        if (relativeTo is AndroidRootViewContainer) {
            relativeTo.renderSurface.getLocationOnScreen(location)
        } else if (relativeTo is AndroidViewContainer) {
            relativeTo.view.getLocationOnScreen(location)
        }

        return (_event.rawY - location[1]) / Environment.HighDpiFactor
    }

    override fun preventDefault() {
        _defaultPrevented = true
    }
}
