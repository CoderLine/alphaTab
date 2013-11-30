/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
package alphatab.audio.player;

import alphatab.audio.model.MidiController;
import alphatab.audio.model.MidiFile;
import alphatab.model.Score;
import alphatab.model.Track;

class MidiPlayer implements IMidiTickListener
{
    private static inline var DefaultPercussionChannel = 9;
    private static inline var DefaultInstrument = 25;
    private static inline var DefaultVolume = 127;
    private static inline var DefaultBalance = 64;
    private static inline var DefaultChorus = 0;
    private static inline var DefaultReverb = 0;
    private static inline var DefaultPhaser = 0;
    private static inline var DefaultTremolo = 0;

    private static inline var PercussionChannel = 9;
    private static inline var MaxVolume = 10;
    public static inline var MaxChannels = 16;
    
    private var _score:Score;
    private var _midiFile:MidiFile;
    
    private var _volume:Int;
    private var _metronomeEnabled:Bool;
    private var _anySolo:Bool;

    private var _isStarting:Bool;
    private var _isRunning:Bool;
    private var _isPaused:Bool;
    
    private var _tickChanged:Bool;
    private var _tick:Int;
    
    private var _sequencer:MidiSequencer;
    private var _midiTickListeners:Array<IMidiTickListener>;
    
    public function new() 
    {
        _volume = MaxVolume;
        _midiTickListeners = new Array<IMidiTickListener>();
        _sequencer = new MidiSequencer();
        _sequencer.addTickChangeListener(this);
    }
    
    public function getScore()
    {
        return _score;
    }
    
    public function setScore(score:Score)
    {
        _score = score;
        buildMidiFile();
        reset();
    }    
    public function getMidiFile()
    {
        return _midiFile;
    } 
    
    public function getVolume():Int
    {
        return _volume;
    }
    
    public function setVolume(volume:Int)
    {
        _volume = volume;
        if (isRunning())
            updateControllers();
    }
    
    public function isRunning() : Bool
    {
        return _isRunning || _sequencer.isRunning() || _isStarting;
    }
    
    public function isPaused()
    {
        return _isPaused;
    }
    
    public function getTick()
    {
        return _sequencer.getTick();
    }
    
    public function setTick(tick:Int)
    {
        _sequencer.setTick(tick);
    }
    
    public function isMetronomeEnabled()
    {
        return _metronomeEnabled;        
    }
    
    public function setMetronomeEnabled(enabled:Bool)
    {
        _metronomeEnabled = enabled;
        _sequencer.setMute(_midiFile.metronomeTrack, !enabled);
        _sequencer.setSolo(_midiFile.metronomeTrack, enabled && _anySolo);
    }
    
    public function getOutputPort() : IMidiOutputPort
    {
        return _sequencer.getOutputPort();
    }
    
    public function setOutputPort(outputPort:IMidiOutputPort)
    {
        _sequencer.setOutputPort(outputPort);
    }
    
    public function reset()
    {
        stop();
    }
    
    public function close()
    {
        _sequencer.close();
        getOutputPort().close();
    }
    
    public function start()
    {
        _isStarting = true;
        getOutputPort().open();
        
        systemReset();
        updatePrograms();
        updateControllers();
        updateDefaultControllers();
        setMetronomeEnabled(isMetronomeEnabled());
        
        _isRunning = true;
        _sequencer.start();
        _isStarting = false;
    }
    
    public function stop()
    {
        _sequencer.stop();
        _isPaused = false; 
        _isRunning = false;
    }
    
    public function pause()
    {
        _sequencer.stop();
        _isPaused = true; 
        _isRunning = false;
    }
    
    public function tickChanged(tick:Int)
    {
        
    }
    
    public function finished() : Void
    {
        reset();
    }
    
    public function buildMidiFile()
    {
        
    }
    
    public function systemReset()
    {
        getOutputPort().sendSystemReset();
    }
    
    public function updatePrograms()
    {
        for (t in _score.tracks)
        {
            getOutputPort().sendProgramChange(t.playbackInfo.primaryChannel, t.playbackInfo.program);
            if (t.playbackInfo.primaryChannel != t.playbackInfo.secondaryChannel)
            {
                getOutputPort().sendProgramChange(t.playbackInfo.secondaryChannel, t.playbackInfo.program);
            }
        }
    }
    
    public function updateControllers()
    {
        _anySolo = false;
        var percussionUpdated = false;
        for (t in _score.tracks)
        {
            updateControllerForTrack(t);
            _anySolo = _anySolo || t.playbackInfo.isSolo;
            percussionUpdated = percussionUpdated || t.isPercussion;         
        }
        
        if (!percussionUpdated && _metronomeEnabled)
        {
            var volume = Std.int( (_volume / 10.0) * DefaultVolume );
            updateController(PercussionChannel, volume, DefaultBalance, DefaultChorus, DefaultReverb, DefaultPhaser, DefaultTremolo, 127);
        }
        
        _sequencer.setSolo(_midiFile.infoTrack, _anySolo);
        _sequencer.setSolo(_midiFile.metronomeTrack, _metronomeEnabled && _anySolo);
    }
    
    public function updateControllerForTrack(t:Track)
    {
        var volume = Std.int((_volume / 10.00) * t.playbackInfo.volume);
        var balance = DefaultBalance;
        var chorus = DefaultChorus;
        var reverb = DefaultReverb;
        var phaser = DefaultPhaser;
        var tremolo = DefaultTremolo;
        
        updateController(t.playbackInfo.primaryChannel, volume, balance, chorus, reverb, phaser, tremolo, 127);
        if (t.playbackInfo.primaryChannel != t.playbackInfo.secondaryChannel)
        {
            updateController(t.playbackInfo.secondaryChannel, volume, balance, chorus, reverb, phaser, tremolo, 127);
        }
    }
    
    private function updateController(channel:Int, volume:Int, balance:Int, chorus:Int, reverb:Int, phaser:Int, tremolo:Int, expression:Int)
    {
        getOutputPort().sendController(channel, MidiController.Volume, volume);
        getOutputPort().sendController(channel, MidiController.Balance, balance);
        getOutputPort().sendController(channel, MidiController.Chorus, chorus);
        getOutputPort().sendController(channel, MidiController.Reverb, reverb);
        getOutputPort().sendController(channel, MidiController.Phaser, phaser);
        getOutputPort().sendController(channel, MidiController.Tremolo, tremolo);
        getOutputPort().sendController(channel, MidiController.Expression, expression);
    }

    
    public function updateDefaultControllers()
    {
        for (channel in 0 ... MaxChannels)
        {
            getOutputPort().sendController(channel, MidiController.RpnMsb, 0);
            getOutputPort().sendController(channel, MidiController.RpnLsb, 0);
            getOutputPort().sendController(channel, MidiController.DataEntryMsb, 12);
            getOutputPort().sendController(channel, MidiController.DataEntryLsb, 0);
        }
    }
    
    public function addMidiTickListener(listener:IMidiTickListener)
    {
        if (Lambda.has(_midiTickListeners, listener))
        {
            _midiTickListeners.push(listener);
        }
    }
    
    public function removeMidiTickListener(listener:IMidiTickListener)
    {
        _midiTickListeners.remove(listener);
    }
}