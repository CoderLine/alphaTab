package alphaTab.platform.android

import alphaTab.*
import alphaTab.EventEmitter
import alphaTab.core.ecmaScript.Error
import alphaTab.core.ecmaScript.Uint8Array
import alphaTab.importer.ScoreLoader
import alphaTab.model.Score
import alphaTab.platform.Cursors
import alphaTab.platform.IContainer
import alphaTab.platform.IMouseEventArgs
import alphaTab.platform.IUiFacade
import alphaTab.rendering.IScoreRenderer
import alphaTab.rendering.RenderFinishedEventArgs
import alphaTab.rendering.utils.Bounds
import alphaTab.synth.IAlphaSynth
import alphaTab.synth.ISynthOutput
import android.os.Handler
import android.view.View
import android.view.ViewTreeObserver
import android.widget.HorizontalScrollView
import android.widget.ScrollView
import java.io.ByteArrayOutputStream
import java.io.InputStream
import kotlin.contracts.ExperimentalContracts


@ExperimentalContracts
@ExperimentalUnsignedTypes
class AndroidUiFacade : IUiFacade<AlphaTabView> {
    private var _handler: Handler
    private var _internalRootContainerBecameVisible: EventEmitter? = EventEmitter()
    private val _outerScroll: HorizontalScrollView
    private val _innerScroll: ScrollView
    private val _renderSurface: AlphaTabRenderSurface

    public constructor(
        outerScroll: HorizontalScrollView,
        innerScroll: ScrollView,
        renderSurface: AlphaTabRenderSurface
    ) {
        _outerScroll = outerScroll
        _innerScroll = innerScroll
        _renderSurface = renderSurface

        rootContainer = AndroidRootViewContainer(outerScroll, innerScroll)
        _handler = Handler(outerScroll.context.mainLooper)

        rootContainerBecameVisible = object : IEventEmitter,
            ViewTreeObserver.OnGlobalLayoutListener, View.OnLayoutChangeListener {
            override fun on(value: () -> Unit) {
                if (rootContainer.isVisible) {
                    value()
                } else {
                    outerScroll.viewTreeObserver.addOnGlobalLayoutListener(this)
                    outerScroll.addOnLayoutChangeListener(this)
                }
            }

            override fun off(value: () -> Unit) {
                _internalRootContainerBecameVisible?.off(value)
            }

            override fun onGlobalLayout() {
                outerScroll.viewTreeObserver.removeOnGlobalLayoutListener(this)
                outerScroll.removeOnLayoutChangeListener(this)
                if (rootContainer.isVisible) {
                    _internalRootContainerBecameVisible?.trigger()
                    _internalRootContainerBecameVisible = null
                }
            }

            override fun onLayoutChange(
                v: View?,
                left: Int,
                top: Int,
                right: Int,
                bottom: Int,
                oldLeft: Int,
                oldTop: Int,
                oldRight: Int,
                oldBottom: Int
            ) {
                onGlobalLayout()
            }
        }
    }


    public override val resizeThrottle: Double
        get() = 25.0

    public override val areWorkersSupported: Boolean
        get() = true

    override val canRender: Boolean
        get() = true

    public lateinit var api: AlphaTabApiBase<AlphaTabView>
    public lateinit var settingsContainer: AlphaTabView

    public override fun initialize(api: AlphaTabApiBase<AlphaTabView>, settings: AlphaTabView) {
        this.api = api
        settingsContainer = settings
        api.settings = settings.settings
        _renderSurface.requestRender = {
            api.renderer.renderResult(it)
        }
        settings.settingsChanged.on(this::onSettingsChanged)
    }

    private fun onSettingsChanged() {
        api.settings = settingsContainer.settings
        api.updateSettings()
        api.render()
    }

    override fun createWorkerRenderer(): IScoreRenderer {
        return AndroidThreadScoreRenderer(api.settings, this::beginInvoke)
    }

    private fun openDefaultSoundFont(): InputStream {
        return settingsContainer.context.assets.open("sonivox.sf2")
    }

    override fun createWorkerPlayer(): IAlphaSynth? {
        return null
//        val player = AndroidThreadAlphaSynthWorkerPlayer(
//            createSynthOutput(),
//            api.settings.core.logLevel, this::beginInvoke
//        )
//        player.ready.on {
//            val soundFont = openDefaultSoundFont()
//            val bos = ByteArrayOutputStream()
//            soundFont.use {
//                soundFont.copyTo(bos)
//                player.loadSoundFont(Uint8Array(bos.toByteArray().toUByteArray()), false)
//            }
//        }
//        return player
    }

    private fun createSynthOutput(): ISynthOutput {
        TODO("Not yet implemented")
    }

    override lateinit var rootContainer: IContainer

    private val _canRenderChanged: EventEmitter = EventEmitter()
    override val canRenderChanged: IEventEmitter
        get() = _canRenderChanged

    override var rootContainerBecameVisible: IEventEmitter

    override fun destroy() {
        settingsContainer.settingsChanged.off(this::onSettingsChanged)
    }

    override fun triggerEvent(
        container: IContainer,
        eventName: String,
        details: Any?,
        originalEvent: IMouseEventArgs?
    ) {
    }

    override fun initialRender() {
        api.renderer.preRender.on { _ ->
            _renderSurface.clearPlaceholders()
        }

        rootContainerBecameVisible.on {
            api.renderer.width = rootContainer.width
            api.renderer.updateSettings(api.settings)
            renderTracks()
        }
    }

    private fun renderTracks() {
        settingsContainer.renderTracks()
    }

    override fun beginAppendRenderResults(renderResults: RenderFinishedEventArgs?) {
        _handler.post {
            if (renderResults == null) {
                _renderSurface.trimPlaceholders()
            } else {
                _renderSurface.addPlaceholder(renderResults)
            }
        }
    }

    override fun beginUpdateRenderResults(renderResults: RenderFinishedEventArgs) {
        _handler.post {
            _renderSurface.fillPlaceholder(renderResults)
        }
    }


    override fun destroyCursors() {
    }

    override fun createCursors(): Cursors? {
        return null
    }

    override fun createCanvasElement(): IContainer {
        return AndroidViewContainer(_renderSurface)
    }

    override fun beginInvoke(action: () -> Unit) {
        _handler.post(action)
    }

    override fun removeHighlights() {
    }

    override fun createSelectionElement(): IContainer? {
        return null
    }

    override fun highlightElements(groupId: String, masterBarIndex: Double) {
    }

    override fun getScrollContainer(): IContainer {
        return rootContainer
    }

    override fun getOffset(scrollElement: IContainer?, container: IContainer): Bounds {
        val bounds = Bounds()
        // TODO
        bounds.x = 0.0
        bounds.y = 0.0
        bounds.w = container.width
        bounds.h = container.height
        return bounds
    }

    override fun scrollToX(scrollElement: IContainer, offset: Double, speed: Double) {
        val view = (scrollElement as AndroidViewContainer)._view
        if (view is ScrollView) {
            view.smoothScrollTo(offset.toInt(), view.scrollY)
        }
    }

    override fun scrollToY(scrollElement: IContainer, offset: Double, speed: Double) {
        val view = (scrollElement as AndroidViewContainer)._view
        if (view is ScrollView) {
            view.smoothScrollTo(view.scrollX, offset.toInt())
        }
    }

    override fun load(
        data: Any?,
        success: (arg1: Score) -> Unit,
        error: (arg1: Error) -> Unit
    ): Boolean {
        when (data) {
            data is Score -> {
                success(data as Score)
                return true
            }
            data is ByteArray -> {
                success(
                    ScoreLoader.loadScoreFromBytes(
                        Uint8Array((data as ByteArray).asUByteArray()),
                        api.settings
                    )
                )
                return true
            }
            data is UByteArray -> {
                success(
                    ScoreLoader.loadScoreFromBytes(
                        Uint8Array((data as UByteArray)),
                        api.settings
                    )
                )
                return true
            }
            data is InputStream -> {
                val bos = ByteArrayOutputStream()
                (data as InputStream).copyTo(bos)
                success(
                    ScoreLoader.loadScoreFromBytes(
                        Uint8Array(bos.toByteArray().asUByteArray()),
                        api.settings
                    )
                )
                return true
            }
            else -> {
                return false
            }
        }
    }

    override fun loadSoundFont(data: Any?, append: Boolean): Boolean {
        val player = api.player ?: return false

        when (data) {
            data is ByteArray -> {
                player.loadSoundFont(Uint8Array((data as ByteArray).asUByteArray()), append)
                return true;
            }
            data is UByteArray -> {
                player.loadSoundFont(Uint8Array((data as UByteArray)), append)
                return true;
            }
            data is InputStream -> {
                val bos = ByteArrayOutputStream()
                (data as InputStream).copyTo(bos)
                player.loadSoundFont(Uint8Array(bos.toByteArray().asUByteArray()), append)
                return true
            }
            else -> {
                return false
            }
        }
    }
}
