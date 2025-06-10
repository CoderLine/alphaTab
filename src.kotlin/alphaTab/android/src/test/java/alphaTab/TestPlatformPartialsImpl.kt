package alphaTab

import alphaTab.collections.BooleanList
import alphaTab.collections.DoubleBooleanMap
import alphaTab.collections.DoubleDoubleMap
import alphaTab.collections.DoubleList
import alphaTab.collections.DoubleObjectMap
import alphaTab.collections.ObjectBooleanMap
import alphaTab.collections.ObjectDoubleMap
import alphaTab.core.ArrayTuple
import alphaTab.core.IArrayTuple
import alphaTab.core.ecmaScript.Uint8Array
import kotlinx.coroutines.CompletableDeferred
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.InputStream
import java.io.OutputStream
import java.nio.file.Paths
import kotlin.contracts.ExperimentalContracts
import kotlin.reflect.KClass

@ExperimentalUnsignedTypes
@ExperimentalContracts
class TestPlatformPartials {
    companion object {
        fun deleteFile(path: String) {
            val filePath = Paths.get(projectRoot, path)
            filePath.toFile().delete()
        }

        fun loadFile(path: String): kotlinx.coroutines.Deferred<Uint8Array> {
            return CompletableDeferred(loadFileSync(path))
        }

        fun loadFileSync(path: String): Uint8Array {
            val fs = openFileRead(path)
            val ms = ByteArrayOutputStream()
            fs.use {
                fs.copyTo(ms)
            }
            return Uint8Array(ms.toByteArray().asUByteArray())
        }

        val projectRoot: String by lazy {
            var path = Paths.get("").toAbsolutePath()
            while (!Paths.get(path.toString(), "package.json").toFile().exists()) {
                path = path.parent
                    ?: throw AlphaTabError(AlphaTabErrorType.General, "Could not find project root")
            }
            path.toString()
        }

        private fun openFileRead(path: String): InputStream {
            val sub = Paths.get(path)
            val filePath = if(sub.isAbsolute) sub else Paths.get(projectRoot, path)
            return filePath.toFile().inputStream()
        }

        private fun openFileWrite(path: String): OutputStream {
            val sub = Paths.get(path)
            val fullPath = if(sub.isAbsolute) sub else Paths.get(projectRoot, path)
            Logger.info("Test", "Saving file '$path' to '$fullPath'")
            fullPath.parent.toFile().mkdirs()
            return fullPath.toFile().outputStream()
        }


        fun saveFile(name: String, data: Uint8Array) {
            val fs = openFileWrite(name)
            fs.use {
                fs.write(data.buffer.asByteArray())
            }
        }


        fun joinPath(vararg path: String): String {
            return path.joinToString(File.separator)
        }

        fun listDirectory(path: String): alphaTab.collections.List<String> {
            val dirPath = Paths.get(projectRoot, path)
            return alphaTab.collections.List(dirPath.toFile()
                .listFiles()
                ?.filter { it.isFile }
                ?.map { it.name } ?: emptyList())
        }

        internal inline fun <reified T : Enum<T>> enumValues(
            @Suppress("UNUSED_PARAMETER") type: KClass<T>
        ): alphaTab.collections.List<T> {
            return alphaTab.collections.List(enumValues<T>().toMutableList())
        }

        internal fun mapAsUnknownIterable(map: Any?): Iterable<IArrayTuple<Any?, Any?>>  = when(map) {
            is alphaTab.collections.Map<*, *> -> map.map { ArrayTuple(it.key, it.value) }
            is DoubleBooleanMap -> map.map { ArrayTuple(it.key, it.value) }
            is DoubleDoubleMap -> map.map { ArrayTuple(it.key, it.value) }
            is DoubleObjectMap<*> -> map.map { ArrayTuple(it.key, it.value) }
            is ObjectBooleanMap<*> -> map.map { ArrayTuple(it.key, it.value) }
            is ObjectDoubleMap<*> -> map.map { ArrayTuple(it.key, it.value) }
            else -> throw ClassCastException("Invalid map type: " + map?.javaClass?.name)
        }

        internal fun typedArrayAsUnknownIterable(array: Any?): Iterable<Any?>  = when(array) {
            is alphaTab.collections.List<*> -> array
            is DoubleList -> array.map<Any?> { it }
            is BooleanList -> array.map<Any?> { it }
            else -> throw ClassCastException("Invalid array type: " + array?.javaClass?.name)
        }

        @Suppress("UNCHECKED_CAST")
        internal fun typedArrayAsUnknownArray(array: Any?): alphaTab.collections.List<Any?> = when(array) {
            is alphaTab.collections.List<*> -> array as alphaTab.collections.List<Any?>
            is List<*> -> alphaTab.collections.List(array)
            is DoubleList -> alphaTab.collections.List(array.map<Any?> { it })
            is BooleanList -> alphaTab.collections.List(array.map<Any?> { it })
            null -> throw Error("Unknown Array Type: null")
            else -> throw Error("Unknown Array Type: ${array::class.qualifiedName}")
        }
    }
}
