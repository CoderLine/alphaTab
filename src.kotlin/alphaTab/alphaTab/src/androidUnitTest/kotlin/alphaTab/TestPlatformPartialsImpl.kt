package alphaTab

import alphaTab.core.ecmaScript.Uint8Array
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.InputStream
import java.io.OutputStream
import java.nio.file.Paths
import kotlin.contracts.ExperimentalContracts

@ExperimentalUnsignedTypes
@ExperimentalContracts
actual class TestPlatformPartials {
    actual companion object {
        actual fun deleteFile(path: String) {
            val filePath = Paths.get(projectRoot, path)
            filePath.toFile().delete()
        }

        actual fun loadFile(path: String): Uint8Array {
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
            println(path.toString())
            path.toString()
        }

        private fun openFileRead(path: String): InputStream {
            val filePath = Paths.get(projectRoot, path)
            return filePath.toFile().inputStream()
        }

        private fun openFileWrite(path: String): OutputStream {
            val subpath = Paths.get(path)
            val fullPath = Paths.get(projectRoot, subpath.toString())
            Logger.info("Test", "Saving file '$path' to '$fullPath'")
            fullPath.parent.toFile().mkdirs()
            return fullPath.toFile().outputStream()
        }


        actual fun saveFile(name: String, data: Uint8Array) {
            val fs = openFileWrite(name)
            fs.use {
                fs.write(data.buffer.asByteArray())
            }
        }


        actual fun joinPath(vararg path: String): String {
            return path.joinToString(File.separator)
        }

        actual fun listDirectory(path: String): alphaTab.collections.List<String> {
            val dirPath = Paths.get(projectRoot, path)
            return alphaTab.collections.List(dirPath.toFile()
                .listFiles()
                ?.filter { it.isFile }
                ?.map { it.name } ?: emptyList())
        }
    }
}
