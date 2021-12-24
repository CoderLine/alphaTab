package alphaTab.platform.android

import android.content.Context
import com.google.android.flexbox.*

class AlphaTabLayoutManager : FlexboxLayoutManager {
    private var _width: Int = 0
    private var _height: Int = 0

    constructor(context: Context?) :
        super(context, FlexDirection.ROW, FlexWrap.WRAP) {
        justifyContent = JustifyContent.FLEX_START
        alignItems = AlignItems.FLEX_START
    }

    override fun getWidth(): Int {
        return if (isMainAxisDirectionHorizontal)
            Math.max(_width, super.getWidth())
        else
            super.getWidth()
    }

    override fun getHeight(): Int {
        return if (!isMainAxisDirectionHorizontal)
            Math.max(_height, super.getHeight())
        else
            super.getHeight()
    }

    fun setContentWidth(value: Int) {
        _width = value
        requestLayout()
    }

    fun setContentHeight(value: Int) {
        _height = value
        requestLayout()
    }

    fun updateOrientation(vertical: Boolean) {
        flexDirection = if (vertical) {
            FlexDirection.ROW
        } else {
            FlexDirection.COLUMN
        }
    }
}
