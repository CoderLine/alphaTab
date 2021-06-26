package alphaTab.platform.android

import android.content.Context
import android.util.AttributeSet
import android.view.ViewGroup
import com.google.android.flexbox.*

class AlphaTabLayoutManager : FlexboxLayoutManager {
    constructor(context: Context?) :
        super(context, FlexDirection.ROW, FlexWrap.WRAP) {
        justifyContent = JustifyContent.FLEX_START
        alignItems = AlignItems.FLEX_START
    }
}
