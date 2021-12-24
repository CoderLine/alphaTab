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
