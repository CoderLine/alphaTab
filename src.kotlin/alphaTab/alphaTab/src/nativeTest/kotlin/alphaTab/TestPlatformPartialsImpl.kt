package alphaTab

import alphaTab.core.ecmaScript.Uint8Array
import alphaTab.io.ByteBuffer
import kotlinx.cinterop.*
import platform.posix.*
import kotlin.contracts.ExperimentalContracts


@ExperimentalUnsignedTypes
@ExperimentalContracts
public class TestPlatformPartials {
    companion object {
        public fun loadFile(path: String): Uint8Array {
            val fs = openFileRead(path)
                ?: throw AlphaTabError(AlphaTabErrorType.General, "File '$path' not found")
            try {
                val buffer = ByteBuffer.withCapacity(1024.0)
                val readBuffer = ByteArray(1024)
                val readArray = Uint8Array(readBuffer.asUByteArray())
                readBuffer.usePinned {
                    var count = 1UL
                    while (count > 0UL) {
                        count = fread(it.addressOf(0), 1, readBuffer.size.toULong(), fs)
                        if (count > 0UL) {
                            buffer.write(readArray, 0.0, count.toDouble())
                        }
                    }
                }
                return buffer.toArray()
            } finally {
                fclose(fs)
            }
        }

        public val projectRoot: String by lazy {
            val cwdPtr = ByteArray(1024)
            cwdPtr.usePinned {
                getcwd(it.addressOf(0), 1024)
            }
            var cwd = cwdPtr.toKString().trimEnd('/', '\\')

            val x = alphaTab.collections.List<String>()

            while (!fileExists("$cwd/package.json") && x.length < 10) {
                cwd = getParent(cwd).trimEnd('/', '\\')
                x.push(cwd)
            }

            cwd
        }

        private fun getParent(cwd: String): String {
            val parent = dirname(cwd.cstr)!!.toKString()
            if (parent.length == 3 && parent[1] == ':' || parent == "/") {
                throw AlphaTabError(AlphaTabErrorType.General, "Could not find project root")
            }
            return parent
        }

        private fun fileExists(path: String): Boolean {
            return memScoped {
                val stat = alloc<stat>()
                val ret = stat(path, stat.ptr)
                return@memScoped ret == 0 && stat.st_size > 0
            }
        }

        private fun openFileRead(path: String): CPointer<FILE>? {
            val absolutePath = "$projectRoot/$path"
            return fopen(absolutePath, "rb")
        }

        private fun openFileWrite(path: String): CPointer<FILE>? {
            val absolutePath = "$projectRoot/test-results/$path"
            Logger.info("Test", "Saving file '$path' to '$absolutePath'")

            val parent = getParent(absolutePath)
            mkdir(parent)
            return fopen(absolutePath, "wb")
        }

        public fun saveFile(name: String, data: Uint8Array) {
            val fs = openFileWrite(name) ?: throw AlphaTabError(
                AlphaTabErrorType.General,
                "Could not open file for writing '$name'"
            )
            try {
                data.buffer.usePinned {
                    fwrite(it.addressOf(0), 1, data.length.toULong(), fs)
                }
            } finally {
                fclose(fs)
            }
        }

        public fun listDirectory(path: String): alphaTab.collections.List<String> {
            val withSlash = if (path.endsWith('/')) path else "$path/"
            val items = alphaTab.collections.List<String>()

            val dir = opendir(path)
            try {
                var sub = readdir(dir)
                while (sub != null) {
                    val d = sub.pointed.d_name.toKString()
                    if (fileExists(withSlash + d)) {
                        items.push(d)
                    }
                    sub = readdir(dir)
                }
            } finally {
                closedir(dir)
            }
            return items
        }
    }
}
