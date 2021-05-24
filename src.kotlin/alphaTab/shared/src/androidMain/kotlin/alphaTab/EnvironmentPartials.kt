package alphaTab

import alphaTab.core.IMap
import alphaTab.platform.android.AndroidCanvas
import kotlin.contracts.ExperimentalContracts

@ExperimentalUnsignedTypes
@ExperimentalContracts
internal actual fun createPlatformSpecificRenderEngines(engines: IMap<String, RenderEngineFactory>) {
    engines.set(
        "android",
        RenderEngineFactory(true) { AndroidCanvas() }
    )
    engines.set(
        "default",
        engines.get("android")!!
    )
}
