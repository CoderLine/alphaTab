package alphaTab

import alphaTab.platform.jvm.SkiaCanvas
import kotlin.contracts.ExperimentalContracts

@ExperimentalUnsignedTypes
@ExperimentalContracts
internal actual fun createPlatformSpecificRenderEngines(engines: alphaTab.collections.Map<String, RenderEngineFactory>) {
    engines.set(
        "skia",
        RenderEngineFactory(true) { SkiaCanvas() }
    )
    engines.set(
        "default",
        engines.get("skia")!!
    )
}
