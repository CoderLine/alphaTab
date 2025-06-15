import * as alphaTab from "@coderline/alphatab";
import React, { useEffect, useState } from "react";
import { useAlphaTab } from "@site/src/hooks";
import CodeBlock from '@theme/CodeBlock';
import './styles.module.scss'

export const AudioExportSample: React.FC = () => {
    const [api, element] = useAlphaTab(s => {
        s.core.file = '/files/Bach_Prelude_BWV999.gp';
        s.player.playerMode = alphaTab.PlayerMode.EnabledSynthesizer;
        s.player.scrollMode = alphaTab.ScrollMode.Off;
        s.player.enableCursor = false;
        s.player.enableUserInteraction = false;
    });

    const [wavUrl, setWavUrl] = useState<string>();

    useEffect(() => {
        // capture url for revocation
        const currentUrl = wavUrl;
        return () => {
            if (currentUrl) {
                URL.revokeObjectURL(currentUrl)
            }
        }
    }, [wavUrl])

    function createWavSampleUrl(chunks: Float32Array[], sampleRate: number): string {
        const samples = chunks.reduce((p, c) => p + c.length, 0);
        const wavHeaderSize = 44;
        const fileSize = wavHeaderSize + samples * 4;
        const buffer = alphaTab.io.ByteBuffer.withCapacity(fileSize);

        //
        // wav header

        // RIFF chunk
        buffer.write(new Uint8Array([0x52, 0x49, 0x46, 0x46]), 0, 4); // RIFF
        alphaTab.io.IOHelper.writeInt32LE(buffer, fileSize - 8); // file size
        buffer.write(new Uint8Array([0x57, 0x41, 0x56, 0x45]), 0, 4); // WAVE

        // format chunk
        buffer.write(new Uint8Array([0x66, 0x6D, 0x74, 0x20]), 0, 4); // fmt␣
        alphaTab.io.IOHelper.writeInt32LE(buffer, 16); // block size
        alphaTab.io.IOHelper.writeInt16LE(buffer, 3); // audio format (1=WAVE_FORMAT_IEEE_FLOAT)
        const channels = 2;
        alphaTab.io.IOHelper.writeInt16LE(buffer, channels); // number of channels
        alphaTab.io.IOHelper.writeInt32LE(buffer, sampleRate); // sample rate
        alphaTab.io.IOHelper.writeInt32LE(buffer, Float32Array.BYTES_PER_ELEMENT * channels * sampleRate); // bytes/second
        const bitsPerSample = Float32Array.BYTES_PER_ELEMENT * 8;
        alphaTab.io.IOHelper.writeInt16LE(buffer, channels * Math.floor((bitsPerSample + 7) / 8)); // block align
        alphaTab.io.IOHelper.writeInt16LE(buffer, bitsPerSample); // bits per sample

        // data chunk
        buffer.write(new Uint8Array([0x64, 0x61, 0x74, 0x61]), 0, 4); // data
        alphaTab.io.IOHelper.writeInt32LE(buffer, samples * 4);
        for (const c of chunks) {
            const bytes = new Uint8Array(c.buffer, c.byteOffset, c.byteLength);
            buffer.write(bytes, 0, bytes.length);
        }

        const blob: Blob = new Blob([
            buffer.toArray()
        ], {
            type: 'audio/wav'
        });
        return URL.createObjectURL(blob);
    }

    async function downloadFile() {
        try {
            // setup options
            const options = new alphaTab.synth.AudioExportOptions();
            options.masterVolume = 0.8;
            options.metronomeVolume = 1;
            options.trackVolume.set(0, 0.5);
            options.sampleRate = 44100;

            // start exporter
            const exporter = await api!.exportAudio(options);

            // collect all chunks in 500ms steps 
            const chunks: Float32Array[] = [];
            try {
                while (true) {
                    const chunk = await exporter.render(500);
                    if (chunk === undefined) {
                        break;
                    }

                    chunks.push(chunk.samples);
                }

            } finally {
                exporter.destroy();
            }

            // use the samples. 
            // in this example: create a wav file and set it as source of the audio element 

            const wav = createWavSampleUrl(chunks, options.sampleRate);
            setWavUrl(wav);
        }
        catch (e) {
            console.error('Error during export', e);
            alert('Something went wrong during export, check the browser logs for details');
        }
    }

    return <>
        <button className="button button--primary" onClick={() => downloadFile()} type="button">Generate WAV</button>
        {wavUrl && <audio src={wavUrl} controls={true} autoPlay={false} />}
        <div ref={element} />
        <CodeBlock language="typescript">
            {[
                "async function generateWav() {",
                "    try {",
                "        // setup options",
                "        const options = new alphaTab.synth.AudioExportOptions();",
                "        options.masterVolume = 0.8;",
                "        options.metronomeVolume = 1;",
                "        options.trackVolume.set(0, 0.5);",
                "        options.sampleRate = 44100;",
                "",
                "        // start exporter",
                "        const exporter = await api!.exportAudio(options);",
                "",
                "        // collect all chunks in 500ms steps ",
                "        const chunks: Float32Array[] = [];",
                "        try {",
                "            while (true) {",
                "                const chunk = await exporter.render(500);",
                "                if (chunk === undefined) {",
                "                    break;",
                "                }",
                "",
                "                chunks.push(chunk.samples);",
                "            }",
                "",
                "        } finally {",
                "            exporter.destroy();",
                "        }",
                "",
                "        // use the samples. ",
                "        // in this example: create a wav file and set it as source of the audio element",
                "",
                "        const wav = convertSamplesToWavBlobUrl(chunks, options.sampleRate);",
                "        ",
                "        // <audio id=\"wav\" controls=\"true\" />",
                "        document.querySelector<HTMLAudioElement>('#wav')!.src = wav;",
                "    }",
                "    catch (e) {",
                "        console.error('Error during export', e);",
                "        alert('Something went wrong during export, check the browser logs for details');",
                "    }",
                "}",
                "",
                "function convertSamplesToWavBlobUrl(chunks: Float32Array[], sampleRate: number): string {",
                "    const samples = chunks.reduce((p, c) => p + c.length, 0);",
                "    const wavHeaderSize = 44;",
                "    const fileSize = wavHeaderSize + samples * 4;",
                "    const buffer = alphaTab.io.ByteBuffer.withCapacity(fileSize);",
                "",
                "    //",
                "    // write wav header",
                "",
                "    // RIFF chunk",
                "    buffer.write(new Uint8Array([0x52, 0x49, 0x46, 0x46]), 0, 4); // RIFF",
                "    alphaTab.io.IOHelper.writeInt32LE(buffer, fileSize - 8); // file size",
                "    buffer.write(new Uint8Array([0x57, 0x41, 0x56, 0x45]), 0, 4); // WAVE",
                "",
                "    // format chunk",
                "    buffer.write(new Uint8Array([0x66, 0x6D, 0x74, 0x20]), 0, 4); // fmt␣",
                "    alphaTab.io.IOHelper.writeInt32LE(buffer, 16); // block size",
                "    alphaTab.io.IOHelper.writeInt16LE(buffer, 3); // audio format (1=WAVE_FORMAT_IEEE_FLOAT)",
                "    const channels = 2;",
                "    alphaTab.io.IOHelper.writeInt16LE(buffer, channels); // number of channels",
                "    alphaTab.io.IOHelper.writeInt32LE(buffer, sampleRate); // sample rate",
                "    alphaTab.io.IOHelper.writeInt32LE(buffer, Float32Array.BYTES_PER_ELEMENT * channels * sampleRate); // bytes/second",
                "    const bitsPerSample = Float32Array.BYTES_PER_ELEMENT * 8;",
                "    alphaTab.io.IOHelper.writeInt16LE(buffer, channels * Math.floor((bitsPerSample + 7) / 8)); // block align",
                "    alphaTab.io.IOHelper.writeInt16LE(buffer, bitsPerSample); // bits per sample",
                "",
                "    // data chunk",
                "    buffer.write(new Uint8Array([0x64, 0x61, 0x74, 0x61]), 0, 4); // data",
                "    alphaTab.io.IOHelper.writeInt32LE(buffer, samples * 4);",
                "    for (const c of chunks) {",
                "        const bytes = new Uint8Array(c.buffer, c.byteOffset, c.byteLength);",
                "        buffer.write(bytes, 0, bytes.length);",
                "    }",
                "",
                "    const blob: Blob = new Blob([",
                "        buffer.toArray()",
                "    ], {",
                "        type: 'audio/wav'",
                "    });",
                "    return URL.createObjectURL(blob);",
                "}",
            ].join('\n')}
        </CodeBlock>
    </>

};