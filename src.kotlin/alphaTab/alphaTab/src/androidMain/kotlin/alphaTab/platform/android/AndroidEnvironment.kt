package alphaTab.platform.android

import alphaTab.Environment
import alphaTab.alphaSkia.AlphaSkiaAndroid
import alphaTab.core.ecmaScript.ArrayBuffer
import android.graphics.Typeface
import android.util.DisplayMetrics
import kotlin.contracts.ExperimentalContracts

internal class AndroidEnvironment {
    companion object {
        private var _isInitialized: Boolean = false

        @ExperimentalUnsignedTypes
        @ExperimentalContracts
        public fun initializeAndroid(context: android.content.Context) {
            if (_isInitialized) {
                return;
            }
            _isInitialized = true

            Environment.HighDpiFactor = context.resources.displayMetrics.density.toDouble()

            AndroidCanvas.initialize(context)

            var bravuraBytes: ByteArray;
            context.assets.open("Bravura.ttf").use {
                bravuraBytes = it.readBytes()
            }

            AlphaSkiaAndroid.INSTANCE.initialize()
            Environment.enableAlphaSkia(bravuraBytes.asUByteArray(), null)
        }
    }
}
