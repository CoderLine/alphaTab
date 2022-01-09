package alphaTab.platform.android

import alphaTab.Environment
import android.util.DisplayMetrics
import kotlin.contracts.ExperimentalContracts

internal class AndroidEnvironment {
    companion object {
        private var _isInitialized: Boolean = false
        @ExperimentalUnsignedTypes
        @ExperimentalContracts
        public fun initializeAndroid(context:android.content.Context) {
            if(_isInitialized) {
                return;
            }
            _isInitialized = true

            Environment.HighDpiFactor = context.resources.displayMetrics.density.toDouble()

            AndroidCanvas.initialize(context);
        }
    }
}
