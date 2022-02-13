package alphaTab

import alphaTab.collections.Map
import alphaTab.platform.android.AndroidCanvas
import kotlin.contracts.ExperimentalContracts

@ExperimentalUnsignedTypes
@ExperimentalContracts
internal actual fun createPlatformSpecificRenderEngines(engines: Map<String, RenderEngineFactory>) {
    engines.set(
        "android",
        RenderEngineFactory(true) { AndroidCanvas() }
    )
    engines.set(
        "default",
        engines.get("android")!!
    )
}
