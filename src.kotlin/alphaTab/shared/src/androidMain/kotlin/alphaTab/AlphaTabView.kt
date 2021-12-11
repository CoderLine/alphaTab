package alphaTab

import alphaTab.collections.BooleanList
import alphaTab.collections.DoubleList
import alphaTab.model.Score
import alphaTab.model.Track
import alphaTab.platform.android.AndroidEnvironment
import alphaTab.platform.android.AndroidUiFacade
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.Drawable
import android.os.Bundle
import android.os.Parcel
import android.os.Parcelable
import android.os.Parcelable.Creator
import android.util.AttributeSet
import android.widget.RelativeLayout
import androidx.recyclerview.widget.RecyclerView
import net.alphatab.R
import kotlin.contracts.ExperimentalContracts

@ExperimentalContracts
@ExperimentalUnsignedTypes
class AlphaTabView : RelativeLayout {
    companion object {
        const val SuperStateKey = "super_state"
        const val LayoutStateKey = "layout_state"
        const val AlphaTabStateKey = "at_state"
    }

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

    override fun onSaveInstanceState(): Parcelable {
        val bundle = Bundle()

        val superState = super.onSaveInstanceState()
        if (superState != null) {
            bundle.putParcelable(SuperStateKey, superState)
        }

        val layoutManagerState = _layoutView.layoutManager?.onSaveInstanceState()
        if (layoutManagerState != null) {
            bundle.putParcelable(LayoutStateKey, layoutManagerState)
        }

        val state = SavedState(superState)
        state.score = _api.score
        state.settings = _api.settings
        state.indexes = _api.tracks.map { it.index }
        bundle.putParcelable(AlphaTabStateKey, state)

        return bundle
    }

    override fun onRestoreInstanceState(state: Parcelable?) {
        if (state is Bundle) {
            if (state.containsKey(SuperStateKey)) {
                super.onRestoreInstanceState(state.getParcelable(SuperStateKey))
            }

            val layoutManager = _layoutView.layoutManager
            if(state.containsKey(LayoutStateKey) && layoutManager != null) {
                layoutManager.onRestoreInstanceState(state.getParcelable(LayoutStateKey))
            }

            if(state.containsKey(AlphaTabStateKey)) {
                val atState = state.getParcelable<SavedState>(AlphaTabStateKey)!!
                _api.settings = atState.settings!!
                _api.renderScore(atState.score!!, atState.indexes)
            }
        } else {
            super.onRestoreInstanceState(state)
        }
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


    class SavedState : BaseSavedState {
        public var score: Score? = null
        public var settings: Settings? = null
        public var indexes: DoubleList = DoubleList()

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

            indexes = DoubleList()
            readList(source, indexes)
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
            writeList(out, indexes)
        }

        private fun writeMap(out: Parcel, map: alphaTab.collections.Map<String, Any?>) {
            out.writeInt(map.size.toInt())
            for (kvp in map) {
                out.writeString(kvp.key)
                writeValue(out, kvp.value)
            }
        }

        private fun writeValue(out: Parcel, value: Any?) {
            when (value) {
                is alphaTab.collections.Map<*, *> -> {
                    @Suppress("UNCHECKED_CAST")
                    writeMap(out, value as alphaTab.collections.Map<String, Any?>)
                }
                is alphaTab.collections.List<*> -> {
                    writeList(out, value)
                }
                is DoubleList -> {
                    writeList(out, value)
                }
                is BooleanList -> {
                    writeList(out, value)
                }
                else -> {
                    out.writeValue(value)
                }
            }
        }

        private fun writeList(out: Parcel, value: alphaTab.collections.List<*>) {
            out.writeInt(value.length.toInt())
            for (v in value) {
                writeValue(out, v)
            }
        }

        private fun writeList(out: Parcel, value: DoubleList) {
            out.writeInt(value.length.toInt())
            for (v in value) {
                out.writeValue(v)
            }
        }

        private fun readList(out: Parcel, value: DoubleList) {
            val size = out.readInt()
            var i = 0
            while (i < size) {
                value.push(out.readDouble())
                i++
            }
        }

        private fun writeList(out: Parcel, value: BooleanList) {
            out.writeInt(value.length.toInt())
            for (v in value) {
                out.writeValue(v)
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
