/*
 * This file is part of alphaTab.
 * Copyright c 2013, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
package alphatab.audio.player;

class MidiTimer
{
    private static inline var TimerDelay = 15;
    private var _sequencer:MidiSequencer;
    
    public function new(sequencer:MidiSequencer)
    {
        _sequencer = sequencer;
    }
    
    public function start()
    {
        #if cs
        
        var thread = new cs.system.threading.Thread(run);
        thread.start();
        
        #end
    }
    
    private function run()
    {
        #if cs
        untyped __cs__("lock(_sequencer) {");
        untyped __cs__("{");
        untyped __cs__("    while (_sequencer.process())");
        untyped __cs__("    {");
        untyped __cs__("        System.Threading.Monitor.Wait(_sequencer, TimerDelay);");
        untyped __cs__("    }");
        untyped __cs__("}");        
        #end
    }
}