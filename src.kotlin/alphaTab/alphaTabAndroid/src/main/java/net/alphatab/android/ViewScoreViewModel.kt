package net.alphatab.android

import alphaTab.LayoutMode
import alphaTab.Settings
import alphaTab.model.Track
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import kotlin.contracts.ExperimentalContracts

@ExperimentalUnsignedTypes
@ExperimentalContracts
class ViewScoreViewModel : ViewModel() {
    public val currentTickPosition = MutableLiveData<Int>().apply {
        value = 0
    }

    public val tracks = MutableLiveData<Iterable<Track>?>()
    public val settings = MutableLiveData<Settings>().apply {
        value = Settings().apply {
            this.player.enableCursor = true
            this.player.enablePlayer = true
            this.player.enableUserInteraction = true
            this.display.barCountPerPartial = 4.0
        }
    }

    public fun updateLayout(screenWidthDp:Float) {
        if (screenWidthDp >= 600f) {
            settings.value!!.display.layoutMode = LayoutMode.Page
        } else {
            settings.value!!.display.layoutMode = LayoutMode.Horizontal
        }
        settings.value = settings.value // fire change
    }
}
