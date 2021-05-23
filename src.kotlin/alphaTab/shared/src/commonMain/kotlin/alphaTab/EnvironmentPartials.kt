package alphaTab

import kotlinx.coroutines.*
import kotlinx.coroutines.flow.flow
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

        private val throttleScope = CoroutineScope(Dispatchers.Default)
        internal fun throttle(toThrottle: () -> Unit, delay: Double): () -> Unit {
            var job:Job? = null
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
