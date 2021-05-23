package alphaTab

import alphaTab.core.ecmaScript.Map
import alphaTab.model.Score
import alphaTab.model.Track
import alphaTab.platform.android.AndroidEnvironment
import alphaTab.platform.android.AndroidUiFacade
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.Drawable
import android.os.Parcel
import android.os.Parcelable
import android.os.Parcelable.Creator
import android.util.AttributeSet
import android.widget.RelativeLayout
import androidx.recyclerview.widget.RecyclerView
import net.alphatab.R
import java.io.StringWriter
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
@ExperimentalUnsignedTypes
class AlphaTabView : RelativeLayout {
    private lateinit var _layoutView: RecyclerView

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
        this.player.enableCursor = true
        // TODO: horizontal layout does not work yet correctly
        //this.display.layoutMode = LayoutMode.Horizontal
    }

    public var settings: Settings
        get() = _settings
        set(value) {
            _settings = value
            (settingsChanged as EventEmitter).trigger()
        }

    public var settingsChanged: IEventEmitter = EventEmitter()

    private var _barCursorFillColor: Drawable = ColorDrawable(Color.argb(64, 255, 242, 0))
    public var barCursorFillColor: Drawable
        get() = _barCursorFillColor
        set(value) {
            _barCursorFillColor = value
            (barCursorFillColorChanged as EventEmitter).trigger()
        }
    public val barCursorFillColorChanged: IEventEmitter = EventEmitter()

    private var _beatCursorFillColor: Drawable = ColorDrawable(Color.argb(191, 64, 64, 255))
    public var beatCursorFillColor: Drawable
        get() = _beatCursorFillColor
        set(value) {
            _beatCursorFillColor = value
            (beatCursorFillColorChanged as EventEmitter).trigger()
        }
    public val beatCursorFillColorChanged: IEventEmitter = EventEmitter()

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

    private fun init(context: Context) {
        AndroidEnvironment.initializeAndroid(context)
        inflate(context, R.layout.alphatab_view, this)
        _layoutView = findViewById(R.id.mainContentView)
        _api = AlphaTabApiBase(AndroidUiFacade(_layoutView), this)
    }

    override fun onSaveInstanceState(): Parcelable? {
        val superState = super.onSaveInstanceState()
        val state = SavedState(superState)
        state.score = _api.score
        state.settings = _api.settings
        state.indexes = _api.tracks.map { it.index }
        return state
    }

    override fun onRestoreInstanceState(state: Parcelable?) {
        super.onRestoreInstanceState(state)
        if(state is SavedState) {
            _api.settings = state.settings!!
            _api.renderScore(state.score!!, state.indexes.toMutableList())
        }
    }

    public fun renderTracks() {
        val tracks = _tracks ?: return

        var score: Score? = null
        val trackIndexes = ArrayList<Double>()
        for (track in tracks) {
            if (score == null) {
                score = track.score
            }
            if (score == track.score) {
                trackIndexes.add(track.index)
            }
        }

        if (score != null) {
            _api.renderScore(score, trackIndexes)
        }
    }


    class SavedState : BaseSavedState {
        public var score: Score? = null
        public var settings: Settings? = null
        public var indexes: List<Double> = emptyList()

        constructor(source: Parcelable?) : super(source)


        constructor(source: Parcel?) : super(source) {
            if (source == null) {
                return
            }
            val scoreSerialized = source.readHashMap(null)
            if (scoreSerialized != null) {
                score = Score()
                alphaTab.generated.model.ScoreSerializer.fromJson(score!!, scoreSerialized)
            }

            val settingsSerialized = source.readHashMap(null)
            if (settingsSerialized != null) {
                settings = Settings()
                alphaTab.generated.SettingsSerializer.fromJson(settings!!, settingsSerialized)
            }

            indexes = emptyList()
            source.readList(indexes, null)
        }

        override fun writeToParcel(out: Parcel?, flags: Int) {
            super.writeToParcel(out, flags)
            if (out == null) {
                return
            }

            val scoreSerialized = alphaTab.generated.model.ScoreSerializer.toJson(score)
            if (scoreSerialized != null) {
                writeMap(out, scoreSerialized)
            }

            val settingsSerialized = alphaTab.generated.SettingsSerializer.toJson(settings)
            if (settingsSerialized != null) {
                writeMap(out, settingsSerialized)
            }

            out.writeList(indexes)
        }

        private fun writeMap(out: Parcel, map: Map<String, Any?>) {
            out.writeInt(map.size.toInt())
            for(kvp in map) {
                out.writeString(kvp.key)
                writeValue(out, kvp.value)

            }
        }

        private fun writeValue(out: Parcel, value: Any?) {
            when (value) {
                is Map<*, *> -> {
                    writeMap(out, value as Map<String, Any?>)
                }
                is List<*> -> {
                    writeList(out, value)
                }
                else -> {
                    out.writeValue(value)
                }
            }
        }

        private fun writeList(out: Parcel, value: List<*>) {
            out.writeInt(value.size)
            for(v in value) {
                writeValue(out, v)
            }
        }

        companion object {
            @JvmField
            val CREATOR: Creator<SavedState?> = object : Creator<SavedState?> {
                override fun createFromParcel(p: Parcel): SavedState {
                    return SavedState(p)
                }

                override fun newArray(size: Int): Array<SavedState?> {
                    return arrayOfNulls(size)
                }
            }
        }
    }
}
