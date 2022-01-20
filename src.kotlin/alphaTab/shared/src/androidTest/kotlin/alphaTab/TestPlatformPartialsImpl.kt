package alphaTab

import alphaTab.core.ecmaScript.Uint8Array
import android.content.ContentResolver
import android.content.ContentUris
import android.content.ContentValues
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import androidx.test.platform.app.InstrumentationRegistry
import java.io.ByteArrayOutputStream
import java.io.InputStream
import java.io.OutputStream
import java.nio.file.Paths
import kotlin.contracts.ExperimentalContracts


@ExperimentalUnsignedTypes
@ExperimentalContracts
public class TestPlatformPartials {
    companion object {
        public fun loadFile(path: String): Uint8Array {
            val fs = openFileRead(path)
            val ms = ByteArrayOutputStream()
            fs.use {
                fs.copyTo(ms)
            }
            return Uint8Array(ms.toByteArray().asUByteArray())
        }

        private val isInstrumented: Boolean by lazy {
            try {
                InstrumentationRegistry.getInstrumentation().context.toString()
                true
            } catch (e: IllegalStateException) {
                false
            }
        }

        public val projectRoot: String by lazy {
            var path = Paths.get("").toAbsolutePath()
            while(!Paths.get(path.toString(), "package.json").toFile().exists()) {
                path = path.parent
                    ?: throw AlphaTabError(AlphaTabErrorType.General, "Could not find project root")
            }
            println(path.toString())
            path.toString()
        }

        private fun openFileRead(path: String): InputStream {
            var subpath = Paths.get(path)
            subpath = subpath.subpath(1, subpath.nameCount)

            return if (isInstrumented) {
                val testContext = InstrumentationRegistry.getInstrumentation().context
                val assets = testContext.assets
                assets.open(subpath.toString())
            } else {
                val filePath = Paths.get(projectRoot, path)
                filePath.toFile().inputStream()
            }
        }

        private fun openFileWrite(path: String): OutputStream {
            val subpath = Paths.get("test-results", path)

            return if (isInstrumented) {
                val testContext = InstrumentationRegistry.getInstrumentation().context
                val values = ContentValues()

                values.put(
                    MediaStore.Files.FileColumns.DISPLAY_NAME,
                    subpath.fileName.toString()
                )

                values.put(
                    MediaStore.Files.FileColumns.MIME_TYPE,
                    "image/png"
                )

                values.put(
                    MediaStore.Files.FileColumns.RELATIVE_PATH,
                    "${Environment.DIRECTORY_DOCUMENTS}/${subpath.parent}"
                )

                val existing = testContext.contentResolver.query(
                    MediaStore.Files.getContentUri("external"),
                    arrayOf(MediaStore.Files.FileColumns._ID),
                    Bundle().apply {
                        putString(
                            ContentResolver.QUERY_ARG_SQL_SELECTION,
                            "${MediaStore.Files.FileColumns.RELATIVE_PATH}=? AND ${MediaStore.Files.FileColumns.DISPLAY_NAME}=?"
                        )
                        putStringArray(
                            ContentResolver.QUERY_ARG_SQL_SELECTION_ARGS, arrayOf(
                                values.getAsString(MediaStore.Files.FileColumns.RELATIVE_PATH),
                                values.getAsString(MediaStore.Files.FileColumns.DISPLAY_NAME)
                            )
                        )
                    },
                    null
                )

                val uri = if (existing != null && existing.count > 0 && existing.moveToFirst()) {
                    ContentUris.withAppendedId(
                        MediaStore.Files.getContentUri("external"),
                        existing.getLong(0)
                    )
                } else {
                    testContext.contentResolver.insert(
                        MediaStore.Files.getContentUri("external"), values
                    )!!
                }

                Logger.info("Test", "Saving file '$path' to '$uri'")
                testContext.contentResolver.openOutputStream(uri)!!
            } else {
                val fullPath = Paths.get(projectRoot, subpath.toString())
                Logger.info("Test", "Saving file '$path' to '$fullPath'")
                fullPath.parent.toFile().mkdirs()
                fullPath.toFile().outputStream()
            }
        }

        public fun saveFile(name: String, data: Uint8Array) {
            val fs = openFileWrite(name)
            fs.use {
                fs.write(data.buffer.asByteArray())
            }
        }

        public fun listDirectory(path: String): alphaTab.collections.List<String> {
            return if (isInstrumented) {
                val testContext = InstrumentationRegistry.getInstrumentation().context
                val assets = testContext.assets
                alphaTab.collections.List(assets.list(path)!!.asIterable())
            } else {
                val dirPath = Paths.get(projectRoot, path)
                alphaTab.collections.List(dirPath.toFile()
                    .listFiles()
                    ?.filter { it.isFile }
                    ?.map { it.name } ?: emptyList())
            }

        }
    }
}
