package alphaTab

@kotlin.contracts.ExperimentalContracts
class EnvironmentPartials {
    companion object {
        internal fun createPlatformSpecificRenderEngines(engines: alphaTab.core.ecmaScript.Map<String, alphaTab.RenderEngineFactory>) {

        }
        internal fun platformInit() {

        }
        internal fun throttle(toThrottle: () -> Unit, delay:Double): () -> Unit {
return toThrottle
        }
    }
}
