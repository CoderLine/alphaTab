package alphaTab

import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
@ExperimentalUnsignedTypes
internal expect fun createPlatformSpecificRenderEngines(engines: alphaTab.core.ecmaScript.Map<String, RenderEngineFactory>)

@Suppress("UNUSED_PARAMETER")
@kotlin.contracts.ExperimentalContracts
@ExperimentalUnsignedTypes
class EnvironmentPartials {
    companion object {
        internal fun createPlatformSpecificRenderEngines(engines: alphaTab.core.ecmaScript.Map<String, RenderEngineFactory>) {
            alphaTab.createPlatformSpecificRenderEngines(engines)
        }

        internal fun platformInit() {

        }

        internal fun throttle(toThrottle: () -> Unit, delay: Double): () -> Unit {
            var job:kotlinx.coroutines.Job? = null
            return {
                job?.cancel()
                job = GlobalScope.launch {
                    delay(delay.toLong())
                    toThrottle()
                }
            }
        }
    }
}
