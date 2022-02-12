package alphaTab.visualTests

import alphaTab.*
import alphaTab.TestPlatform
import alphaTab.collections.DoubleList
import alphaTab.core.ecmaScript.Uint8Array
import alphaTab.core.toInvariantString
import alphaTab.importer.AlphaTexImporter
import alphaTab.importer.ScoreLoader
import alphaTab.io.ByteBuffer
import alphaTab.model.Score
import alphaTab.rendering.RenderFinishedEventArgs
import alphaTab.rendering.ScoreRenderer
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import org.jetbrains.skija.*
import org.junit.Assert
import java.io.ByteArrayOutputStream
import java.nio.file.Paths
import java.util.concurrent.Semaphore
import java.util.concurrent.TimeUnit
import kotlin.contracts.ExperimentalContracts


@ExperimentalContracts
@ExperimentalUnsignedTypes
public class VisualTestHelperPartials {
    companion object {
        public fun runVisualTest(
            inputFile: String,
            settings: Settings? = null,
            tracks: DoubleList? = null,
            message: String? = null,
            tolerancePercent: Double = 1.0,
            triggerResize: Boolean = false
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
                    tolerancePercent,
                    triggerResize
                )
            } catch (e: Throwable) {
                Assert.fail("Failed to run visual test $e ${e.stackTraceToString()}")
            }
        }

        public fun runVisualTestTex(
            tex: String,
            referenceFileName: String,
            settings: Settings? = null,
            tracks: DoubleList? = null,
            message: String? = null,
            tolerancePercent: Double = 1.0,
            triggerResize: Boolean = false
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
                    tolerancePercent,
                    triggerResize
                )
            } catch (e: Throwable) {
                Assert.fail("Failed to run visual test $e")
            }
        }

        private var _initialized: Boolean = false
        public fun runVisualTestScore(
            score: Score,
            referenceFileName: String,
            settings: Settings? = null,
            tracks: DoubleList? = null,
            message: String? = null,
            tolerancePercent: Double = 1.0,
            triggerResize: Boolean = false
        ) {
            if (!_initialized) {
                SkiaCanvas.initialize(TestPlatformPartials.loadFile("test-data/../font/bravura/Bravura.ttf"))
                Environment.renderEngines.set("skia", RenderEngineFactory(true) { SkiaCanvas() })
                loadFonts()
                _initialized = true
            }

            val actualSettings = settings ?: Settings()
            val actualTracks = tracks ?: DoubleList()

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


            var actualReferenceFileName = referenceFileName
            if (!actualReferenceFileName.startsWith("test-data/")) {
                actualReferenceFileName = "test-data/visual-tests/$actualReferenceFileName"
            }

            val referenceFileData = TestPlatformPartials.loadFile(actualReferenceFileName)

            val result = ArrayList<RenderFinishedEventArgs>()
            var totalWidth = 0.0
            var totalHeight = 0.0
            var isResizeRender = false

            val renderer = ScoreRenderer(actualSettings)
            renderer.width = 1300.0

            val waitHandle = Semaphore(1)
            waitHandle.acquire()

            var error: Throwable? = null

            renderer.preRender.on { _ ->
                result.clear()
            }
            renderer.partialRenderFinished.on { e ->
                result.add(e)
            }
            renderer.renderFinished.on { e ->
                totalWidth = e.totalWidth
                totalHeight = e.totalHeight
                result.add(e)
                if (!triggerResize || isResizeRender) {
                    waitHandle.release()
                } else {
                    isResizeRender = true
                    renderer.resizeRender()
                }
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

        private fun loadFonts() {
            SkiaCanvas.registerCustomFont(
                TestPlatformPartials.loadFile("test-data/../font/roboto/Roboto-Regular.ttf")
            )
            SkiaCanvas.registerCustomFont(
                TestPlatformPartials.loadFile("test-data/../font/roboto/Roboto-Italic.ttf")
            )
            SkiaCanvas.registerCustomFont(
                TestPlatformPartials.loadFile("test-data/../font/roboto/Roboto-Bold.ttf")
            )
            SkiaCanvas.registerCustomFont(
                TestPlatformPartials.loadFile("test-data/../font/roboto/Roboto-BoldItalic.ttf")
            )

            SkiaCanvas.registerCustomFont(
                TestPlatformPartials.loadFile("test-data/../font/ptserif/PTSerif-Regular.ttf")
            )
            SkiaCanvas.registerCustomFont(
                TestPlatformPartials.loadFile("test-data/../font/ptserif/PTSerif-Italic.ttf")
            )
            SkiaCanvas.registerCustomFont(
                TestPlatformPartials.loadFile("test-data/../font/ptserif/PTSerif-Bold.ttf")
            )
            SkiaCanvas.registerCustomFont(
                TestPlatformPartials.loadFile("test-data/../font/ptserif/PTSerif-BoldItalic.ttf")
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
            val finalBitmap: Image

            val imageInfo = ImageInfo(
                totalWidth.toInt(),
                totalHeight.toInt(),
                ColorType.BGRA_8888,
                ColorAlphaType.PREMUL
            )

            val finalImageSurface = Surface.makeRaster(imageInfo)
            finalImageSurface.use {
                for (partialResult in result) {
                    val partialCanvas = partialResult.renderResult
                    if (partialCanvas is Image) {
                        finalImageSurface.canvas.drawImage(partialCanvas, partialResult.x.toFloat(), partialResult.y.toFloat())
                    }
                }

                finalBitmap = finalImageSurface.makeImageSnapshot()
            }

            val finalImageFileName =
                TestPlatform.changeExtension(referenceFileName, ".new.png")
            finalBitmap.use {
                val dir = Paths.get(finalImageFileName).parent
                dir.toFile().mkdirs()

                val referenceBitmap =
                    Image.makeFromEncoded(referenceFileData.buffer.asByteArray())

                var pass:Boolean
                var msg:String
                try {
                    val finalBitmapRaw = toRawBytes(finalBitmap)
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

                        val diff = Image.makeRaster(
                            imageInfo,
                            diffData.buffer.asByteArray(),
                            imageInfo.minRowBytes
                        )
                        diff.use {
                            val diffPngData = diff.encodeToData(EncodedImageFormat.PNG)
                            TestPlatformPartials.saveFile(
                                diffImageName,
                                Uint8Array(diffPngData!!.bytes.asUByteArray())
                            )
                        }
                    }

                } catch (e: Throwable) {
                    pass = false
                    msg = "Error comparing images:  ${e.message} ${e.stackTraceToString()}, $message"
                }

                if (!pass) {
                    TestPlatformPartials.saveFile(
                        referenceFileName,
                        referenceFileData
                    )

                    val png = finalBitmap.encodeToData(EncodedImageFormat.PNG)
                    TestPlatformPartials.saveFile(
                        finalImageFileName,
                        Uint8Array(png!!.bytes.asUByteArray())
                    )

                    val newImageName =
                        TestPlatform.changeExtension(referenceFileName, ".new.png")
                    val finalBitmapData = finalBitmap.encodeToData(EncodedImageFormat.PNG)
                    TestPlatformPartials.saveFile(
                        newImageName,
                        Uint8Array(finalBitmapData!!.bytes.asUByteArray())
                    )
                    Assert.fail(msg)
                }
            }
        }

        private fun toRawBytes(image: Image): UByteArray {
            val bitmap = Bitmap.makeFromImage(image)
            bitmap.use {
                return bitmap.readPixels()!!.asUByteArray()
            }
        }
    }
}
