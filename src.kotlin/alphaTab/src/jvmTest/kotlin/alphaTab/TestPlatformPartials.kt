package alphaTab

import alphaTab.core.ecmaScript.Uint8Array
import java.io.ByteArrayOutputStream
import java.io.FileInputStream
import java.nio.file.Paths

@ExperimentalUnsignedTypes
class TestPlatformPartials {
    companion object {
        public fun loadFile(path: String): Uint8Array {
            val fs = FileInputStream(path)
            fs.use {
                val ms = ByteArrayOutputStream()
                fs.copyTo(ms)
                return Uint8Array(ms.toByteArray().asUByteArray())
            }
        }

        public fun saveFile(name:String, data:Uint8Array) {
            val path = Paths.get("text-results", name)
            path.parent.toFile().mkdirs()
            val fs = path.toFile().outputStream()
            fs.use {
                fs.write(data.buffer.raw.asByteArray())
            }
        }

        public fun listDirectory(path:String): MutableList<String> {
            return Paths.get(path).toFile().listFiles()?.map { it.name }?.toMutableList() ?: mutableListOf()
        }
    }
}
