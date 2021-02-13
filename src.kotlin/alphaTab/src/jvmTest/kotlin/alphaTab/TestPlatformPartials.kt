package alphaTab

import alphaTab.core.ecmaScript.Uint8Array
import java.io.ByteArrayOutputStream
import java.io.FileInputStream
import java.nio.file.Path
import java.nio.file.Paths
import kotlin.contracts.ExperimentalContracts

@ExperimentalUnsignedTypes
@ExperimentalContracts
class TestPlatformPartials {
    companion object {
        public val projectRoot: String = findProjectRoot()

        private fun findProjectRoot():String {
            var path = Paths.get("").toAbsolutePath()
            while(!Path.of(path.toString(), "package.json").toFile().exists()) {
                path = path.parent
                    ?: throw AlphaTabError(AlphaTabErrorType.General, "Could not find project root")
            }
            println(path.toString())
            return path.toString()
        }

        public fun loadFile(path: String): Uint8Array {
            val filePath = Path.of(projectRoot, path)
            println("Loading file from $filePath ($projectRoot)")

            val fs = FileInputStream(filePath.toString())
			val ms = ByteArrayOutputStream()
			fs.use {
                fs.copyTo(ms)
            }
			return Uint8Array(ms.toByteArray().asUByteArray())
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
