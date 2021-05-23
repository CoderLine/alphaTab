package alphaTab

import alphaTab.core.ecmaScript.Uint8Array
import android.R.attr
import java.io.ByteArrayOutputStream
import java.nio.file.Paths
import kotlin.contracts.ExperimentalContracts
import androidx.test.platform.app.InstrumentationRegistry
import android.util.Log

import java.io.IOException

import android.R.attr.data
import android.content.Context
import android.provider.MediaStore

import java.io.OutputStreamWriter
import android.net.Uri

import android.R.attr.data
import android.content.ContentValues
import android.os.Environment

import android.R.attr.data
import android.content.ContentResolver
import android.content.ContentUris
import android.os.Bundle


@ExperimentalUnsignedTypes
@ExperimentalContracts
public class TestPlatformPartials {
    companion object {
        public fun loadFile(path: String): Uint8Array {
            var subpath = Paths.get(path)
            subpath = subpath.subpath(1, subpath.nameCount)

            val testContext = InstrumentationRegistry.getInstrumentation().context
            val assets = testContext.assets

            val fs = assets.open(subpath.toString())
            val ms = ByteArrayOutputStream()
            fs.use {
                fs.copyTo(ms)
            }
            return Uint8Array(ms.toByteArray().asUByteArray())
        }

        public fun saveFile(name: String, data: Uint8Array) {
            val testContext = InstrumentationRegistry.getInstrumentation().context

            val values = ContentValues()

            var path = Paths.get(name)

            values.put(
                MediaStore.Files.FileColumns.DISPLAY_NAME,
                path.fileName.toString()
            )

            values.put(
                MediaStore.Files.FileColumns.MIME_TYPE,
                "image/png"
            )

            values.put(
                MediaStore.Files.FileColumns.RELATIVE_PATH,
                "${Environment.DIRECTORY_DOCUMENTS}/test-results/${path.parent}"
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

            Log.i("AlphaTabTest", "Saving file '$name' to '$uri'")
            val fs = testContext.contentResolver.openOutputStream(uri)
            fs?.use {
                fs.write(data.buffer.raw.asByteArray())
            }
        }

        public fun listDirectory(path: String): MutableList<String> {
            val testContext = InstrumentationRegistry.getInstrumentation().context
            val assets = testContext.assets
            return assets.list(path)!!.toMutableList()
        }
    }
}
