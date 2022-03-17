package alphaTab

import alphaTab.collections.Map
import kotlin.contracts.ExperimentalContracts

@ExperimentalUnsignedTypes
@ExperimentalContracts
internal actual fun createPlatformSpecificRenderEngines(engines: Map<String, RenderEngineFactory>) {
//    engines.set(
//        "skia",
//        RenderEngineFactory(true) { SkiaCanvas() }
//    )
//    engines.set(
//        "default",
//        engines.get("skia")!!
//    )
}
