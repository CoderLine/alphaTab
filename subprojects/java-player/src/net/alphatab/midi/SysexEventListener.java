package net.alphatab.midi;

import javax.sound.midi.SysexMessage;

interface SysexEventListener 
{
    void sysex(SysexMessage message);    
}