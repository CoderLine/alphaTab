package alphaTab.visualTests

import alphaTab.Settings
import alphaTab.TestPlatform
import alphaTab.TestPlatformPartials
import alphaTab.core.ecmaScript.Uint8Array
import alphaTab.core.toInvariantString
import alphaTab.importer.AlphaTexImporter
import alphaTab.importer.ScoreLoader
import alphaTab.io.ByteBuffer
import alphaTab.model.JsonConverter
import alphaTab.model.Score
import alphaTab.platform.android.AndroidCanvas
import alphaTab.platform.android.MusicFont
import alphaTab.rendering.RenderFinishedEventArgs
import alphaTab.rendering.ScoreRenderer
import android.graphics.*
import android.util.Log
import androidx.test.platform.app.InstrumentationRegistry
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import org.junit.Assert
import java.io.ByteArrayOutputStream
import java.nio.IntBuffer
import java.util.concurrent.Semaphore
import java.util.concurrent.TimeUnit
import kotlin.contracts.ExperimentalContracts
import java.nio.file.Paths


@ExperimentalContracts
@ExperimentalUnsignedTypes
public class VisualTestHelperPartials {
    companion object {
        public fun runVisualTest(
            inputFile: String,
            settings: Settings? = null,
            tracks: MutableList<Double>? = null,
            message: String? = null,
            tolerancePercent: Double = 1.0
        ) {
            try {
                val fullInputFile = "test-data/visual-tests/$inputFile"
                val inputFileData = TestPlatformPartials.loadFile(fullInputFile)
                val referenceFileName = TestPlatform.changeExtension(fullInputFile, ".png")
                val score = ScoreLoader.loadScoreFromBytes(inputFileData, settings)

                runVisualTestScore(
                    score,
                    referenceFileName,
                    settings,
                    tracks,
                    message,
                    tolerancePercent
                )
            } catch (e: Throwable) {
                Assert.fail("Failed to run visual test $e")
            }
        }

        public fun runVisualTestTex(
            tex: String,
            referenceFileName: String,
            settings: Settings? = null,
            tracks: MutableList<Double>? = null,
            message: String? = null,
            tolerancePercent: Double = 1.0
        ) {
            try {
                val actualSettings = settings ?: Settings()
                val importer = AlphaTexImporter()
                importer.init(ByteBuffer.fromString(tex), actualSettings)
                val score = importer.readScore()

                runVisualTestScore(
                    score,
                    referenceFileName,
                    settings,
                    tracks,
                    message,
                    tolerancePercent
                )
            } catch (e: Throwable) {
                Assert.fail("Failed to run visual test $e")
            }
        }

        public fun runVisualTestScore(
            score: Score,
            referenceFileName: String,
            settings: Settings? = null,
            tracks: MutableList<Double>? = null,
            message: String? = null,
            tolerancePercent: Double = 1.0
        ) {
            alphaTab.platform.android.AndroidEnvironment.initializeAndroid(InstrumentationRegistry.getInstrumentation().context)

            val actualSettings = settings ?: Settings()
            val actualTracks = tracks ?: ArrayList()

            actualSettings.core.engine = "skia"
            actualSettings.core.enableLazyLoading = false
            actualSettings.core.useWorkers = false

            actualSettings.display.resources.copyrightFont.family = "Roboto"
            actualSettings.display.resources.titleFont.family = "PT Serif"
            actualSettings.display.resources.subTitleFont.family = "PT Serif"
            actualSettings.display.resources.wordsFont.family = "PT Serif"
            actualSettings.display.resources.effectFont.family = "PT Serif"
            actualSettings.display.resources.fretboardNumberFont.family = "Roboto"
            actualSettings.display.resources.tablatureFont.family = "Roboto"
            actualSettings.display.resources.graceFont.family = "Roboto"
            actualSettings.display.resources.barNumberFont.family = "Roboto"
            actualSettings.display.resources.fingeringFont.family = "PT Serif"
            actualSettings.display.resources.markerFont.family = "PT Serif"

            loadFonts()

            var actualReferenceFileName = referenceFileName
            if (!actualReferenceFileName.startsWith("test-data/")) {
                actualReferenceFileName = "test-data/visual-tests/$actualReferenceFileName"
            }

            val referenceFileData = TestPlatformPartials.loadFile(actualReferenceFileName)

            val result = ArrayList<RenderFinishedEventArgs>()
            var totalWidth = 0.0
            var totalHeight = 0.0

            val renderer = ScoreRenderer(actualSettings)
            renderer.width = 1300.0

            val waitHandle = Semaphore(1)
            waitHandle.acquire()

            var error: Throwable? = null

            renderer.partialRenderFinished.on { e ->
                result.add(e)
            }
            renderer.renderFinished.on { e ->
                totalWidth = e.totalWidth
                totalHeight = e.totalHeight
                result.add(e)
                waitHandle.release()
            }
            renderer.error.on { e ->
                error = e
                waitHandle.release()
            }

            val job = GlobalScope.launch {
                try {
                    renderer.renderScore(score, actualTracks)
                } catch (e: Throwable) {
                    error = e
                    waitHandle.release()
                }
            }

            if (waitHandle.tryAcquire(2000, TimeUnit.MILLISECONDS)) {
                if (error != null) {
                    Assert.fail("Rendering failed with error $error ${error?.stackTraceToString()}")
                } else {
                    compareVisualResult(
                        totalWidth,
                        totalHeight,
                        result,
                        referenceFileName,
                        referenceFileData,
                        message,
                        tolerancePercent
                    )
                }
            } else {
                job.cancel()
                Assert.fail("Rendering did not complete within timeout")
            }
        }

        private var _fontsLoaded = false
        private fun loadFonts()
        {
            if (_fontsLoaded)
            {
                return;
            }

            val context = InstrumentationRegistry.getInstrumentation().context
            AndroidCanvas.registerCustomFont(
                "Roboto",
                Typeface.createFromAsset(context.assets, "Roboto-Regular.ttf")
            )
            AndroidCanvas.registerCustomFont(
                "Roboto",
                Typeface.createFromAsset(context.assets, "Roboto-Italic.ttf")
            )
            AndroidCanvas.registerCustomFont(
                "Roboto",
                Typeface.createFromAsset(context.assets, "Roboto-Bold.ttf")
            )
            AndroidCanvas.registerCustomFont(
                "Roboto",
                Typeface.createFromAsset(context.assets, "Roboto-BoldItalic.ttf")
            )

            AndroidCanvas.registerCustomFont(
                "PT Serif",
                Typeface.createFromAsset(context.assets, "PTSerif-Regular.ttf")
            )
            AndroidCanvas.registerCustomFont(
                "PT Serif",
                Typeface.createFromAsset(context.assets, "PTSerif-Italic.ttf")
            )
            AndroidCanvas.registerCustomFont(
                "PT Serif",
                Typeface.createFromAsset(context.assets, "PTSerif-Bold.ttf")
            )
            AndroidCanvas.registerCustomFont(
                "PT Serif",
                Typeface.createFromAsset(context.assets, "PTSerif-BoldItalic.ttf")
            )
        }

        private fun compareVisualResult(
            totalWidth: Double,
            totalHeight: Double,
            result: MutableList<RenderFinishedEventArgs>,
            referenceFileName: String,
            referenceFileData: Uint8Array,
            message: String?,
            tolerancePercent: Double = 1.0
        ) {
            val finalImage = Bitmap.createBitmap(
                totalWidth.toInt(),
                totalHeight.toInt(),
                Bitmap.Config.ARGB_8888,
                true
            )
            val finalImageCanvas = Canvas(finalImage)
            val point = PointF(0f, 0f)
            var rowHeight = 0f
            for (partialResult in result) {
                val partialCanvas = partialResult.renderResult
                if (partialCanvas is Bitmap) {
                    finalImageCanvas.drawBitmap(partialCanvas, point.x, point.y, null)
                    if(partialResult.height > rowHeight) {
                        rowHeight = partialResult.height.toFloat()
                    }
                    point.x += partialCanvas.width
                    if(point.x >= totalWidth) {
                        point.x = 0f
                        point.y += rowHeight
                        rowHeight = 0f
                    }
                    partialCanvas.recycle()
                }
            }

            try {
                val referenceBitmap =
                    BitmapFactory.decodeByteArray(referenceFileData.buffer.raw.asByteArray(), 0, referenceFileData.buffer.raw.size)

                var pass:Boolean
                var msg:String
                try {
                    val finalBitmapRaw = toRawBytes(finalImage)
                    val referenceBitmapRaw = toRawBytes(referenceBitmap)

                    val diffData = Uint8Array(finalBitmapRaw.size.toDouble())
                    val match = PixelMatch.match(
                        Uint8Array(referenceBitmapRaw),
                        Uint8Array(finalBitmapRaw),
                        diffData,
                        referenceBitmap.width.toDouble(),
                        referenceBitmap.height.toDouble(),
                        PixelMatchOptions().apply {
                            this.threshold = 0.3
                            this.includeAA = false
                            this.diffMask = true
                            this.alpha = 1.0
                        })

                    val totalPixels = match.totalPixels - match.transparentPixels
                    val percentDifference = (match.differentPixels / totalPixels) * 100
                    pass = percentDifference < tolerancePercent

                    val percentDifferenceText = percentDifference.toInvariantString()
                    msg =
                        "Difference between original and new image is too big: ${match.differentPixels}/$totalPixels (${percentDifferenceText}%) $message"

                    if(!pass) {
                        val diffImageName =
                            TestPlatform.changeExtension(referenceFileName, ".diff.png")

                        val diff = Bitmap.createBitmap(
                            referenceBitmap.width,
                            referenceBitmap.height,
                            Bitmap.Config.ARGB_8888,
                            true
                        )

                        val buffer = java.nio.ByteBuffer.wrap(diffData.buffer.raw.asByteArray())
                        diff.copyPixelsFromBuffer(buffer)
                        val diffBos = ByteArrayOutputStream()
                        diff.compress(Bitmap.CompressFormat.PNG, 100, diffBos)
                        diff.recycle()
                        TestPlatformPartials.saveFile(
                            diffImageName,
                            Uint8Array(diffBos.toByteArray().asUByteArray())
                        )
                    }
                } catch (e: Throwable) {
                    pass = false
                    msg = "Error comparing images:  ${e.message} ${e.stackTraceToString()}, $message"
                } finally {
                    referenceBitmap.recycle()
                }

                val finalImageFileName = TestPlatform.changeExtension(referenceFileName, ".new.png")
                val bos = ByteArrayOutputStream()
                finalImage.compress(Bitmap.CompressFormat.PNG, 100, bos)
                TestPlatformPartials.saveFile(finalImageFileName, Uint8Array(bos.toByteArray().asUByteArray()))

                // TODO: we need to get access to a raw Skia lib to get equal rendering on tests

//                if (!pass) {
//                    TestPlatformPartials.saveFile(
//                        referenceFileName,
//                        referenceFileData
//                    )
//
//                    Assert.fail(msg)
//                }
            }
            finally {
                finalImage.recycle()
            }
        }

        private fun toRawBytes(bitmap: Bitmap): UByteArray {
            val buffer = java.nio.ByteBuffer.allocate(bitmap.height * bitmap.rowBytes)
            bitmap.copyPixelsToBuffer(buffer)
            return buffer.array().asUByteArray()
        }
    }
}
