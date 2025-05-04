package alphaTab

import alphaTab.platform.android.AndroidCanvas
import alphaTab.platform.android.AndroidEnvironment
import android.os.Build
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
@ExperimentalUnsignedTypes
internal class EnvironmentPartials {
    companion object {
        internal fun createPlatformSpecificRenderEngines(engines: alphaTab.collections.Map<String, RenderEngineFactory>) {
            engines.set(
                "android",
                RenderEngineFactory(true) { AndroidCanvas() }
            )
            engines.set(
                "default",
                engines.get("skia")!!
            )
        }

        internal fun platformInit() {
        }

        internal fun printPlatformInfo(print: (message: String) -> Unit) {
            print("OS Name: ${System.getProperty("os.name")}");
            print("OS Version: ${System.getProperty("os.version")}");
            print("Device Brand: ${Build.MANUFACTURER}");
            print("Device Model: ${Build.MODEL}");
            print("SDK Version: ${Build.VERSION.SDK_INT}");
            print("Screen Size: ${AndroidEnvironment.screenWidth}x${AndroidEnvironment.screenHeight}");
        }

        private val throttleScope = CoroutineScope(Dispatchers.Default)
        internal fun throttle(toThrottle: () -> Unit, delay: Double): () -> Unit {
            var job: Job? = null
            return {
                job?.cancel()
                job = throttleScope.launch {
                    delay(delay.toLong())
                    toThrottle()
                }
            }
        }
    }
}
