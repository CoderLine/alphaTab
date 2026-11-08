package alphaTab.platform.android

import alphaTab.Environment
import alphaTab.EnvironmentPartials
import alphaTab.RenderEngineFactory
import alphaTab.alphaSkia.AlphaSkiaAndroid
import alphaTab.core.ecmaScript.ArrayBuffer
import android.graphics.Typeface
import android.os.Build
import android.util.DisplayMetrics
import kotlin.contracts.ExperimentalContracts

internal class AndroidEnvironment {
    companion object {
        private var _isInitialized: Boolean = false

        var screenWidth:Int = 0;
        var screenHeight:Int = 0;

        @ExperimentalUnsignedTypes
        @ExperimentalContracts
        public fun initializeAndroid(context: android.content.Context) {
            if (_isInitialized) {
                return;
            }
            _isInitialized = true

            Environment.highDpiFactor = context.resources.displayMetrics.density.toDouble()

            screenWidth = context.resources.displayMetrics.widthPixels
            screenHeight = context.resources.displayMetrics.heightPixels

            AndroidCanvas.initialize(context)
            Environment.renderEngines.set(
                "android",
                RenderEngineFactory(true) { AndroidCanvas() }
            )
            EnvironmentPartials.printHostInfo = { print ->
                print("Device Brand: ${Build.MANUFACTURER}");
                print("Device Model: ${Build.MODEL}");
                print("SDK Version: ${Build.VERSION.SDK_INT}");
                print("Screen Size: ${screenWidth}x${screenHeight}");
            }

            var bravuraBytes: ByteArray;
            context.assets.open("Bravura.otf").use {
                bravuraBytes = it.readBytes()
            }

            AlphaSkiaAndroid.INSTANCE.initialize()
            Environment.enableAlphaSkia(bravuraBytes.asUByteArray(), null)
        }
    }
}
