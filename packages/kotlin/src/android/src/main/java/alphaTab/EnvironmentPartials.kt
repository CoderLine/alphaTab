package alphaTab

import alphaTab.collections.DoubleList
import alphaTab.platform.Json
import alphaTab.platform.jvm.JavaThreadAlphaSynthWorker
import alphaTab.platform.jvm.JavaThreadAlphaTabRendererWorker
import alphaTab.platform.worker.IAlphaSynthWorkerMessage
import alphaTab.platform.worker.IAlphaTabWorkerGlobalScope
import alphaTab.platform.worker.IAlphaTabWorkerMessage
import alphaTab.synth.AudioExportOptions
import kotlin.contracts.ExperimentalContracts


@ExperimentalContracts
@ExperimentalUnsignedTypes
internal class EnvironmentPartials {
    companion object {
        /**
         * Prints additional information about the host platform (e.g. the Android device).
         */
        internal var printHostInfo: ((print: (message: String) -> Unit) -> Unit)? = null

        internal fun _createPlatformSpecificRenderEngines(engines: alphaTab.collections.Map<String, RenderEngineFactory>) {
            engines.set(
                "default",
                engines.get("skia")!!
            )
        }

        internal fun _printPlatformInfo(print: (message: String) -> Unit) {
            print("OS Name: ${System.getProperty("os.name")}");
            print("OS Version: ${System.getProperty("os.version")}");
            printHostInfo?.invoke(print)
        }

        @Suppress("NOTHING_TO_INLINE")
        internal inline fun quoteJsonString(string: String) = Json.quoteJsonString(string)

        @Suppress("NOTHING_TO_INLINE")
        internal inline fun sortDescending(list: DoubleList) = list.sortDescending()

        internal inline fun <reified T> getGlobalWorkerScope(): IAlphaTabWorkerGlobalScope<T> {
            @Suppress("UNCHECKED_CAST")
            return when (T::class) {
                IAlphaSynthWorkerMessage::class -> JavaThreadAlphaSynthWorker.currentThreadWorker as IAlphaTabWorkerGlobalScope<T>
                IAlphaTabWorkerMessage::class -> JavaThreadAlphaTabRendererWorker.currentThreadWorker as IAlphaTabWorkerGlobalScope<T>
                else -> throw UnsupportedOperationException("Unsupported worker scope kind ${T::class::qualifiedName}")
            }
        }

        inline fun <reified T> prepareForPostMessage(v:T) = v
    }
}
