package net.alphatab.android

import alphaTab.AlphaTabView
import alphaTab.LogLevel
import alphaTab.Logger
import alphaTab.core.ecmaScript.Uint8Array
import alphaTab.importer.ScoreLoader
import alphaTab.model.Score
import alphaTab.synth.PlayerState
import android.content.res.Configuration
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.WindowManager
import android.widget.Button
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.google.android.material.floatingactionbutton.FloatingActionButton
import java.io.ByteArrayOutputStream
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
@ExperimentalUnsignedTypes
class MainActivity : AppCompatActivity() {

    private lateinit var _viewModel: ViewScoreViewModel
    private lateinit var _alphaTabView: AlphaTabView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        _alphaTabView = findViewById(R.id.alphatab_view)
        _viewModel = ViewModelProvider(this).get(ViewScoreViewModel::class.java)

        val playButton = findViewById<FloatingActionButton>(R.id.play_button)

        _alphaTabView.api.playerReady.on {
            playButton.isEnabled = true
        }

        _alphaTabView.api.playerStateChanged.on {
            if (it.state == PlayerState.Playing) {
                playButton.setImageResource(android.R.drawable.ic_media_pause)
                window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            } else {
                playButton.setImageResource(android.R.drawable.ic_media_play)
                window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            }
        }

        observeViewModel()

        val widthDp = resources.displayMetrics.widthPixels /
            resources.displayMetrics.density
        _viewModel.updateLayout(widthDp)

        findViewById<FloatingActionButton>(R.id.open_file_button).setOnClickListener {
            openFile.launch(arrayOf("*/*"))
        }

        playButton.setOnClickListener {
            _alphaTabView.api.playPause()
        }
    }

    private fun observeViewModel() {
        _viewModel.settings.observe(this, {
            _alphaTabView.settings = it
        })
        _viewModel.tracks.observe(this, {
            _alphaTabView.tracks = it
        })
    }

    private val openFile = registerForActivityResult(ActivityResultContracts.OpenDocument()) {
        val uri = it ?: return@registerForActivityResult
        val score: Score
        try {
            val fileData = readFileData(uri)
            score = ScoreLoader.loadScoreFromBytes(fileData, _alphaTabView.settings)
            Log.i("AlphaTab", "File loaded: ${score.title}")
        } catch (e: Exception) {
            Log.e("AlphaTab", "Failed to load file: $e, ${e.stackTraceToString()}")
            Toast.makeText(this, R.string.open_failed, Toast.LENGTH_LONG).show()
            return@registerForActivityResult
        }

        try {
            _viewModel.tracks.value = arrayListOf(score.tracks[0])
        } catch (e: Exception) {
            Log.e("AlphaTab", "Failed to render file: $e, ${e.stackTraceToString()}")
            Toast.makeText(this, R.string.open_failed, Toast.LENGTH_LONG).show()
        }
    }

    private fun readFileData(uri: Uri): Uint8Array {
        val inputStream = contentResolver.openInputStream(uri)
        inputStream.use {
            ByteArrayOutputStream().use {
                inputStream!!.copyTo(it)
                return Uint8Array(it.toByteArray().asUByteArray())
            }
        }
    }
}
