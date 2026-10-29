/** @target web */
import fs from 'node:fs';
import path from 'node:path';
import { ScoreSerializer } from '@coderline/alphatab/generated/model/ScoreSerializer';
import { SettingsSerializer } from '@coderline/alphatab/generated/SettingsSerializer';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { Color } from '@coderline/alphatab/model/Color';
import { Font, FontStyle } from '@coderline/alphatab/model/Font';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import type { Score } from '@coderline/alphatab/model/Score';
import { NotationElement } from '@coderline/alphatab/NotationSettings';
import { Settings } from '@coderline/alphatab/Settings';
import { describe, expect, it } from 'vitest';
import { ComparisonHelpers } from './ComparisonHelpers';

/**
 * The web-only object serializers (`toJsObject`) against the Map serializers (`toJson`): the worker hand-off
 * must decode to the same model and the public JSON strings must stay byte-identical.
 */
describe('JsonConverterJsObjectTest', () => {
    const scoreExtensions = /\.(gp|gp[3-5]|gpx|xml|musicxml|mxml|mxl|cap|capx)$/i;

    function mapReplacer(_: string, v: unknown) {
        return v instanceof Map ? Object.fromEntries(v) : v;
    }

    function mapPathJson(jsObject: unknown) {
        return JSON.stringify(jsObject, mapReplacer);
    }

    function listScores(dir: string): string[] {
        const files: string[] = [];
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, e.name);
            if (e.isDirectory()) {
                files.push(...listScores(p));
            } else if (scoreExtensions.test(e.name)) {
                files.push(p);
            }
        }
        return files.sort();
    }

    function tryLoad(file: string): Score | null {
        try {
            return ScoreLoader.loadScoreFromBytes(new Uint8Array(fs.readFileSync(file)));
        } catch {
            return null;
        }
    }

    function expectSameAsMapPath(score: Score, name: string) {
        const mapObject = JsonConverter.scoreToJsObject(score);
        const plainObject = ScoreSerializer.toJsObject(score);

        expect(JsonConverter.scoreToJson(score), name).toBe(mapPathJson(mapObject));

        const settings = new Settings();
        const fromMap = JsonConverter.jsObjectToScore(structuredClone(mapObject), settings);
        const fromPlain = JsonConverter.jsObjectToScore(structuredClone(plainObject), settings);
        ComparisonHelpers.expectJsonEqual(
            JsonConverter.scoreToJsObject(fromMap),
            JsonConverter.scoreToJsObject(fromPlain),
            `<${name}>`,
            null
        );
        // unlike expectJsonEqual, sensitive to key and Map entry order and to ids
        expect(mapPathJson(JsonConverter.scoreToJsObject(fromPlain)), name).toBe(
            mapPathJson(JsonConverter.scoreToJsObject(fromMap))
        );
    }

    const root = 'test-data';
    for (const folder of fs.readdirSync(root, { withFileTypes: true }).filter(e => e.isDirectory())) {
        it(`test-data/${folder.name}`, () => {
            let loaded = 0;
            for (const file of listScores(path.join(root, folder.name))) {
                const score = tryLoad(file);
                if (score) {
                    expectSameAsMapPath(score, file);
                    loaded++;
                }
            }
            expect(loaded > 0 || folder.name === 'corrupt' || folder.name === 'xml').toBe(true);
        }, 300_000);
    }

    function customizedSettings() {
        const settings = new Settings();
        settings.core.scriptFile = 'script';
        settings.core.tracks = [1, 2, 3];
        settings.display.scale = 10;
        settings.display.resources.elementFonts.set(
            NotationElement.ScoreCopyright,
            new Font('copy', 15, FontStyle.Plain)
        );
        settings.display.resources.staffLineColor = new Color(255, 0, 0, 100);
        settings.display.padding = [1, 2, 3, 4];
        settings.notation.elements.set(NotationElement.EffectCapo, false);
        settings.player.scrollElement = 'scroll';
        return settings;
    }

    it('settings', () => {
        for (const settings of [new Settings(), customizedSettings()]) {
            const mapObject = JsonConverter.settingsToJsObject(settings);
            const plainObject = SettingsSerializer.toJsObject(settings);

            expect(JsonConverter.settingsToJson(settings)).toBe(mapPathJson(mapObject));

            const fromMap = JsonConverter.jsObjectToSettings(structuredClone(mapObject));
            const fromPlain = JsonConverter.jsObjectToSettings(structuredClone(plainObject));
            expect(mapPathJson(JsonConverter.settingsToJsObject(fromPlain))).toBe(
                mapPathJson(JsonConverter.settingsToJsObject(fromMap))
            );
        }
    });

    it('records-are-objects', () => {
        const score = tryLoad('test-data/guitarpro7/hammer.gp')!;
        const plainObject = ScoreSerializer.toJsObject(score)!;
        expect(plainObject).not.toBeInstanceOf(Map);
        const track = (plainObject.tracks as unknown[])[0];
        expect(track).not.toBeInstanceOf(Map);
        expect(typeof track).toBe('object');
    });
});
