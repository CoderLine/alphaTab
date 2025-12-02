package alphaTab

import alphaTab.collections.BooleanList
import alphaTab.collections.DoubleBooleanMap
import alphaTab.collections.DoubleDoubleMap
import alphaTab.collections.DoubleList
import alphaTab.collections.DoubleObjectMap
import alphaTab.collections.ObjectBooleanMap
import alphaTab.collections.ObjectDoubleMap
import alphaTab.core.ArrayTuple
import alphaTab.core.DoubleDoubleArrayTuple
import alphaTab.core.IArrayTuple
import alphaTab.core.IDoubleDoubleArrayTuple
import alphaTab.core.IRecord
import alphaTab.core.ecmaScript.Record
import alphaTab.core.ecmaScript.Uint8Array
import alphaTab.core.toInvariantString
import com.beust.klaxon.Converter
import com.beust.klaxon.JsonObject
import com.beust.klaxon.JsonValue
import com.beust.klaxon.Klaxon
import com.beust.klaxon.KlaxonException
import kotlinx.coroutines.CompletableDeferred
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.InputStream
import java.io.OutputStream
import java.io.OutputStreamWriter
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

        val serializer = Klaxon().let { klaxon ->
            klaxon
                .converter(object : Converter {
                    override fun canConvert(cls: Class<*>): Boolean {
                        return cls == IDoubleDoubleArrayTuple::class.java ||
                            cls == DoubleDoubleArrayTuple::class.java
                    }

                    override fun fromJson(jv: JsonValue): Any =
                        if (jv.array != null && jv.array!!.value[0] is Double && jv.array!!.value[1] is Double) {
                            DoubleDoubleArrayTuple(
                                jv.array!!.value[0] as Double,
                                jv.array!!.value[1] as Double
                            )
                        } else {
                            throw KlaxonException("Couldn't decode array tuple: ${jv}")
                        }

                    override fun toJson(value: Any): String {
                        val tuple = value as DoubleDoubleArrayTuple
                        return """[${tuple.v0.toInvariantString()}, ${tuple.v1.toInvariantString()}"""
                    }
                })
                .converter(object : Converter {
                    override fun canConvert(cls: Class<*>): Boolean {
                        return cls == SmuflMetadata::class.java
                    }

                    override fun fromJson(jv: JsonValue): Any {
                        var engravingDefaults = SmuflEngravingDefaults(
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0
                        )
                        val glyphBBoxes = Record<String, SmuflGlyphBoundingBox>()
                        val glyphsWithAnchors = Record<String, SmuflGlyphWithAnchor>()

                        val obj = jv.obj
                        if (obj != null) {
                            obj.keys.forEach { key ->
                                when (key) {
                                    "engravingDefaults" -> {
                                        engravingDefaults = klaxon.fromJsonObject(
                                            obj.obj(key)!!,
                                            SmuflEngravingDefaults::class.java,
                                            SmuflEngravingDefaults::class
                                        ) as SmuflEngravingDefaults
                                    }

                                    "glyphBBoxes" -> {
                                        recordFromJson(glyphBBoxes,
                                            obj.obj(key)!!,
                                            SmuflGlyphBoundingBox::class
                                        )
                                    }

                                    "glyphsWithAnchors" -> {
                                        recordFromJson(glyphsWithAnchors,
                                            obj.obj(key)!!,
                                            SmuflGlyphWithAnchor::class
                                        )
                                    }
                                }
                            }
                        } else {
                            throw KlaxonException("Couldn't decode SmuflMetadata: $jv")
                        }

                        return SmuflMetadata(engravingDefaults, glyphsWithAnchors, glyphBBoxes)
                    }

                    override fun toJson(value: Any): String {
                        val record = value as SmuflMetadata

                        val valueList = arrayListOf<String>()

                        valueList.add("\"engravingDefaults\": ${klaxon.toJsonString(record.engravingDefaults)}")
                        valueList.add("\"glyphBBoxes\": ${recordToJson(record.glyphBBoxes)}")
                        valueList.add("\"glyphsWithAnchors\": ${recordToJson(record.glyphsWithAnchors)}")

                        return "{" + valueList.joinToString(",") + "}"
                    }

                    fun <TValue : Any> recordFromJson(record: Record<String, TValue>, obj:JsonObject, valueClass: KClass<TValue>) {
                        obj.keys.forEach { key ->
                            @Suppress("UNCHECKED_CAST")
                            val value = klaxon.fromJsonObject(
                                obj.obj(key)!!,
                                valueClass.java,
                                valueClass
                            ) as TValue
                            record.set(key, value)
                        }
                    }

                    fun recordToJson(record: Record<*, *>?): String {
                        if (record == null) {
                            return "null";
                        }
                        val valueList = arrayListOf<String>()

                        record.forEach { entry ->
                            val jsonValue =
                                if (entry.value == null) "null"
                                else klaxon.toJsonString(entry.value as Any)
                            valueList.add("\"${entry.key}\": $jsonValue")
                        }

                        return "{" + valueList.joinToString(",") + "}"
                    }
                })
        }


        internal inline fun <reified T> loadFileAsJson(path: String): T {
            return openFileRead(path).use {
                serializer.parse<T>(it)!!
            }
        }

        val projectRoot: String by lazy {
            var path = Paths.get("").toAbsolutePath()
            while (!Paths.get(path.toString(), ".git").toFile().exists()) {
                path = path.parent
                    ?: throw AlphaTabError(AlphaTabErrorType.General, "Could not find project root")
            }
            Paths.get(path.toString(), "packages", "alphatab").toString()
        }

        private fun openFileRead(path: String): InputStream {
            val sub = Paths.get(path)
            val filePath = if (sub.isAbsolute) sub else Paths.get(projectRoot, path)
            return filePath.toFile().inputStream()
        }

        private fun openFileWrite(path: String): OutputStream {
            val sub = Paths.get(path)
            val fullPath = if (sub.isAbsolute) sub else Paths.get(projectRoot, path)
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

        fun saveFileAsString(name: String, data: String) {
            val fs = openFileWrite(name)
            fs.use {
                val writer = OutputStreamWriter(fs)
                writer.write(data)
            }
        }


        fun joinPath(vararg path: String): String {
            return path.joinToString(File.separator)
        }

        fun listDirectory(path: String): alphaTab.collections.List<String> {
            val dirPath = Paths.get(projectRoot, path)
            return alphaTab.collections.List(
                dirPath.toFile()
                    .listFiles()
                    ?.filter { it.isFile }
                    ?.map { it.name } ?: emptyList())
        }

        internal inline fun <reified T : Enum<T>> enumValues(
            @Suppress("UNUSED_PARAMETER") type: KClass<T>
        ): alphaTab.collections.List<T> {
            return alphaTab.collections.List(enumValues<T>().toMutableList())
        }

        internal fun setAsUnknownIterable(set: Any?): Iterable<Any?> =
                when(set) {
                    is alphaTab.core.ecmaScript.Set<*> -> set
                    is Iterable<*> -> set
                    else -> throw ClassCastException("Invalid set type: " + set?.javaClass?.name)
                }
        internal fun mapAsUnknownIterable(map: Any?): Iterable<IArrayTuple<Any?, Any?>> =
            when (map) {
                is alphaTab.collections.Map<*, *> -> map.map { ArrayTuple(it.key, it.value) }
                is DoubleBooleanMap -> map.map { ArrayTuple(it.key, it.value) }
                is DoubleDoubleMap -> map.map { ArrayTuple(it.key, it.value) }
                is DoubleObjectMap<*> -> map.map { ArrayTuple(it.key, it.value) }
                is ObjectBooleanMap<*> -> map.map { ArrayTuple(it.key, it.value) }
                is ObjectDoubleMap<*> -> map.map { ArrayTuple(it.key, it.value) }
                else -> throw ClassCastException("Invalid map type: " + map?.javaClass?.name)
            }

        internal fun typedArrayAsUnknownIterable(array: Any?): Iterable<Any?> = when (array) {
            is alphaTab.collections.List<*> -> array
            is DoubleList -> array.map<Any?> { it }
            is BooleanList -> array.map<Any?> { it }
            else -> throw ClassCastException("Invalid array type: " + array?.javaClass?.name)
        }

        @Suppress("UNCHECKED_CAST")
        internal fun typedArrayAsUnknownArray(array: Any?): alphaTab.collections.List<Any?> =
            when (array) {
                is alphaTab.collections.List<*> -> array as alphaTab.collections.List<Any?>
                is List<*> -> alphaTab.collections.List(array)
                is DoubleList -> alphaTab.collections.List(array.map<Any?> { it })
                is BooleanList -> alphaTab.collections.List(array.map<Any?> { it })
                null -> throw Error("Unknown Array Type: null")
                else -> throw Error("Unknown Array Type: ${array::class.qualifiedName}")
            }

        internal fun getConstructorName(o:Any?) =
            when(o) {
                is IRecord -> "Object"
                null -> ""
                else -> o.javaClass.name
            }
    }
}
