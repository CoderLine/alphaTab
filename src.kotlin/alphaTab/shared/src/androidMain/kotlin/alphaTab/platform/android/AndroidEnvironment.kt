package alphaTab.platform.android

import kotlin.contracts.ExperimentalContracts

public class AndroidEnvironment {
    companion object {
        private var _isInitialized: Boolean = false
        @ExperimentalUnsignedTypes
        @ExperimentalContracts
        public fun initializeAndroid(context:android.content.Context) {
            if(_isInitialized) {
                return;
            }
            _isInitialized = true
            AndroidCanvas.initialize(context);
        }
    }
}
