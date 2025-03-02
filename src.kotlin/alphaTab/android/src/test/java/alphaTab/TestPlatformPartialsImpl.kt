package alphaTab

import alphaTab.core.ecmaScript.Uint8Array
import kotlinx.coroutines.CompletableDeferred
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.InputStream
import java.io.OutputStream
import java.nio.file.Paths
import kotlin.contracts.ExperimentalContracts

@ExperimentalUnsignedTypes
@ExperimentalContracts
class TestPlatformPartials {
    companion object {
        fun deleteFile(path: String) {
            val filePath = Paths.get(projectRoot, path)
            filePath.toFile().delete()
        }

        fun loadFile(path: String): kotlinx.coroutines.Deferred<Uint8Array> {
            val fs = openFileRead(path)
            val ms = ByteArrayOutputStream()
            fs.use {
                fs.copyTo(ms)
            }
            return CompletableDeferred(Uint8Array(ms.toByteArray().asUByteArray()))
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
            val fullPath = Paths.get(projectRoot, path)
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
    }
}
