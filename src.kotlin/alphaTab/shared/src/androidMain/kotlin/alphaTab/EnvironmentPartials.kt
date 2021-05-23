package alphaTab

import alphaTab.platform.android.AndroidCanvas
import kotlin.contracts.ExperimentalContracts

@ExperimentalUnsignedTypes
@ExperimentalContracts
internal actual fun createPlatformSpecificRenderEngines(engines: alphaTab.core.ecmaScript.Map<String, RenderEngineFactory>) {
    engines.set(
        "android",
        RenderEngineFactory(true) { AndroidCanvas() }
    )
    engines.set(
        "default",
        engines.get("android")!!
    )
}
