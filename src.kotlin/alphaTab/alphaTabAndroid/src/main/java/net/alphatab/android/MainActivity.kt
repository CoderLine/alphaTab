package net.alphatab.android

import alphaTab.AlphaTabView
import alphaTab.LayoutMode
import alphaTab.LogLevel
import alphaTab.Logger
import alphaTab.core.ecmaScript.Uint8Array
import alphaTab.importer.ScoreLoader
import android.app.Activity
import android.content.Intent
import android.net.Uri
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import java.io.ByteArrayOutputStream
import kotlin.contracts.ExperimentalContracts

const val OPEN_REQUEST_CODE = 41

@ExperimentalContracts
@ExperimentalUnsignedTypes
class MainActivity : AppCompatActivity() {

    private lateinit var _alphaTabView: AlphaTabView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        _alphaTabView = findViewById(R.id.alphatab_view)
        _alphaTabView.settings.core.logLevel = LogLevel.Info
        _alphaTabView.settings.display.scale = 3.0
        _alphaTabView.settings.display.barCountPerPartial = 4.0
        Logger.logLevel = LogLevel.Debug
    }

    fun openFile(view: View) {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT)
        intent.addCategory(Intent.CATEGORY_OPENABLE)
        intent.type = "*/*"
        startActivityForResult(intent, OPEN_REQUEST_CODE)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (resultCode == Activity.RESULT_OK) {
            if (requestCode == OPEN_REQUEST_CODE) {
                val uri = data!!.data
                try {
                    val fileData = readFileData(uri!!)
                    val score = ScoreLoader.loadScoreFromBytes(fileData, _alphaTabView.settings)
                    _alphaTabView.tracks = arrayListOf(score.tracks[0])
                } catch (e: Exception) {
                    Log.e("AlphaTab", "Failed to load file: $e, ${e.stackTraceToString()}")
                    Toast.makeText(this, R.string.open_failed, Toast.LENGTH_LONG)
                }
                return
            }
        }
        super.onActivityResult(requestCode, resultCode, data)
    }

    private fun readFileData(uri: Uri): Uint8Array {
        val inputStream = contentResolver.openInputStream(uri)
        inputStream.use {
            val bos = ByteArrayOutputStream()
            inputStream!!.copyTo(bos)
            return Uint8Array(bos.toByteArray().asUByteArray())
        }
    }
}
