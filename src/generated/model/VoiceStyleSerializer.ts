// <auto-generated>
// This code was auto-generated.
// Changes to this file may cause incorrect behavior and will be lost if
// the code is regenerated.
// </auto-generated>
import { VoiceStyle } from "@src/model/Voice";
import { JsonHelper } from "@src/io/JsonHelper";
import { VoiceSubElement } from "@src/model/Voice";
import { Color } from "@src/model/Color";
export class VoiceStyleSerializer {
    public static fromJson(obj: VoiceStyle, m: unknown): void {
        if (!m) {
            return;
        }
        JsonHelper.forEach(m, (v, k) => VoiceStyleSerializer.setProperty(obj, k, v));
    }
    public static toJson(obj: VoiceStyle | null): Map<string, unknown> | null {
        if (!obj) {
            return null;
        }
        const o = new Map<string, unknown>();
        {
            const m = new Map<string, unknown>();
            o.set("colors", m);
            for (const [k, v] of obj.colors!) {
                m.set(k.toString(), Color.toJson(v));
            }
        }
        return o;
    }
    public static setProperty(obj: VoiceStyle, property: string, v: unknown): boolean {
        switch (property) {
            case "colors":
                obj.colors = new Map<VoiceSubElement, Color | null>();
                JsonHelper.forEach(v, (v, k) => {
                    obj.colors.set(JsonHelper.parseEnum<VoiceSubElement>(k, VoiceSubElement)!, Color.fromJson(v));
                });
                return true;
        }
        return false;
    }
}
