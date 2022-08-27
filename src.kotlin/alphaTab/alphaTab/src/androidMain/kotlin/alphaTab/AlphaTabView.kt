package alphaTab

import alphaTab.collections.DoubleList
import alphaTab.model.Score
import alphaTab.model.Track
import alphaTab.platform.android.*
import alphaTab.rendering.layout.HorizontalScreenLayout
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.Drawable
import android.util.AttributeSet
import android.widget.HorizontalScrollView
import android.widget.RelativeLayout
import android.widget.ScrollView
import net.alphatab.R
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
@ExperimentalUnsignedTypes
class AlphaTabView : RelativeLayout {
    private lateinit var _api: AlphaTabApiBase<AlphaTabView>

    private var _tracks: Iterable<Track>? = null
    public var tracks: Iterable<Track>?
        get() = _tracks
        set(value) {
            _tracks = value
            renderTracks()
        }

    private var _settings: Settings = Settings().apply {
        this.player.enableCursor = true
        this.player.enablePlayer = true
        this.player.enableUserInteraction = true
    }

    public var settings: Settings
        get() = _settings
        set(value) {
            _settings = value
            (settingsChanged as EventEmitter).trigger()
        }

    public var settingsChanged: IEventEmitter = EventEmitter()

    private var _barCursorFillColor: Int = Color.argb(64, 255, 242, 0)
    public var barCursorFillColor: Int
        get() = _barCursorFillColor
        set(value) {
            _barCursorFillColor = value
        }

    private var _beatCursorFillColor: Int = Color.argb(191, 64, 64, 255)
    public var beatCursorFillColor: Int
        get() = _beatCursorFillColor
        set(value) {
            _beatCursorFillColor = value
        }

    private var _selectionFillColor: Int = Color.argb(25, 64, 64, 255)
    public var selectionFillColor: Int
        get() = _selectionFillColor
        set(value) {
            _selectionFillColor = value
        }

    public val api: AlphaTabApiBase<AlphaTabView>
        get() = _api

    constructor(context: Context, attrs: AttributeSet?) : this(context, attrs, 0)
    constructor(context: Context, attrs: AttributeSet?, defStyleAttr: Int) : super(
        context,
        attrs,
        defStyleAttr
    ) {
        init(context)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        _api.destroy()
    }

    private fun init(context: Context) {
        AndroidEnvironment.initializeAndroid(context)
        inflate(context, R.layout.alphatab_view, this)

        val outerScroll = findViewById<SuspendableHorizontalScrollView>(R.id.outerScroll)
        val innerScroll = findViewById<SuspendableScrollView>(R.id.innerScroll)
        val renderSurface = findViewById<AlphaTabRenderSurface>(R.id.renderSurface)
        val renderWrapper = findViewById<RelativeLayout>(R.id.renderWrapper)
        _api =
            AlphaTabApiBase(
                AndroidUiFacade(outerScroll, innerScroll, renderWrapper, renderSurface),
                this
            )
    }

    public fun renderTracks() {
        val tracks = _tracks ?: return

        var score: Score? = null
        val trackIndexes = DoubleList()
        for (track in tracks) {
            if (score == null) {
                score = track.score
            }
            if (score == track.score) {
                trackIndexes.push(track.index)
            }
        }

        if (score != null) {
            _api.renderScore(score, trackIndexes)
        }
    }
}
