package alphaTab.visualTests

import alphaTab.Settings
import alphaTab.TestPlatform
import alphaTab.TestPlatformPartials
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
import java.util.concurrent.Semaphore
import java.util.concurrent.TimeUnit
import kotlin.contracts.ExperimentalContracts
import java.nio.file.Paths


@ExperimentalContracts
@ExperimentalUnsignedTypes
class VisualTestHelperPartials {
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
            val actualSettings = settings ?: Settings()
            val actualTracks = tracks ?: ArrayList()

            actualSettings.core.engine = "skia"
            actualSettings.core.enableLazyLoading = false
            actualSettings.core.useWorkers = false

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
                var x = 0f
                var y = 0f
                var rowHeight = 0
                for (partialResult in result) {
                    val partialCanvas = partialResult.renderResult
                    if (partialCanvas is Image) {
                        finalImageSurface.canvas.drawImage(partialCanvas, x, y)
                        if (partialResult.height > rowHeight) {
                            rowHeight = partialCanvas.height
                        }

                        x += partialCanvas.width

                        if (x >= totalWidth) {
                            x = 0f
                            y += rowHeight
                            rowHeight = 0
                        }
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
                    Image.makeFromEncoded(referenceFileData.buffer.raw.asByteArray())

                try {
                    val finalBitmapRaw = toRawBytes(imageInfo, finalBitmap)
                    val referenceBitmapRaw = toRawBytes(imageInfo, referenceBitmap)

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
                    val pass = percentDifference < tolerancePercent
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


                        val percentDifferenceText = percentDifference.toInvariantString()
                        val msg =
                            "Difference between original and new image is too big: ${match.differentPixels}/$totalPixels (${percentDifferenceText}%) $message"

                        val diffImageName =
                            TestPlatform.changeExtension(referenceFileName, ".diff.png")

                        println(diffImageName)

                        val diff = toImage(imageInfo, diffData.buffer.raw)
                        diff.use {
                            val diffPngData = diff.encodeToData(EncodedImageFormat.PNG)
                            TestPlatformPartials.saveFile(
                                diffImageName,
                                Uint8Array(diffPngData!!.bytes.asUByteArray())
                            )
                        }

                        val newImageName =
                            TestPlatform.changeExtension(referenceFileName, ".new.png")
                        val finalBitmapData = finalBitmap.encodeToData(EncodedImageFormat.PNG)
                        TestPlatformPartials.saveFile(
                            newImageName,
                            Uint8Array(finalBitmapData!!.bytes.asUByteArray())
                        )
                        Assert.fail(msg)
                    }
                } catch (e: Throwable) {
                    Assert.fail("Error comparing images:  ${e.message} ${e.stackTraceToString()}, $message")
                }
            }
        }

        // Workaround for missing Skija methods
        // https://github.com/JetBrains/skija/issues/95

        private fun toImage(imageInfo: ImageInfo, raw: UByteArray): Image {
            val bitmap = Bitmap()
            bitmap.use {
                bitmap.imageInfo = imageInfo
                bitmap.allocPixels()
                bitmap.installPixels(bitmap.imageInfo, raw.asByteArray(), bitmap.rowBytes)


                val surface = Surface.makeRaster(bitmap.imageInfo)
                surface.use {
                    surface.writePixels(bitmap, 0, 0)
                    return surface.makeImageSnapshot()
                }
            }
        }

        private fun toRawBytes(imageInfo: ImageInfo, image: Image): UByteArray {
            val bitmap = Bitmap()
            bitmap.imageInfo = imageInfo
            bitmap.allocPixels()

            val canvas = Canvas(bitmap)
            canvas.use {
                canvas.drawImage(image, 0f, 0f)
            }

            val raw = bitmap.readPixels(bitmap.imageInfo, bitmap.rowBytes, 0, 0)
            return raw!!.asUByteArray()
        }
    }
}
