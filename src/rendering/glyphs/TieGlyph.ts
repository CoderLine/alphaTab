import { Beat } from '@src/model/Beat';
import { ICanvas } from '@src/platform/ICanvas';
import { BarRendererBase } from '@src/rendering/BarRendererBase';
import { Glyph } from '@src/rendering/glyphs/Glyph';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';

export class TieGlyph extends Glyph {
    protected startBeat: Beat | null;
    protected endBeat: Beat | null;
    protected yOffset: number = 0;
    protected forEnd: boolean;

    protected startNoteRenderer: BarRendererBase | null = null;
    protected endNoteRenderer: BarRendererBase | null = null;
    protected tieDirection: BeamDirection = BeamDirection.Up;

    public constructor(startBeat: Beat | null, endBeat: Beat | null, forEnd: boolean) {
        super(0, 0);
        this.startBeat = startBeat;
        this.endBeat = endBeat;
        this.forEnd = forEnd;
    }

    public doLayout(): void {
        this.width = 0;
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        if (!this.endBeat) {
            return;
        }

        // TODO fix nullability of start/end beat,
        let startNoteRenderer = (this.startNoteRenderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
            this.renderer.staff.staveId,
            this.startBeat!.voice.bar
        ));
        let endNoteRenderer = (this.endNoteRenderer = this.renderer.scoreRenderer.layout!.getRendererForBar(
            this.renderer.staff.staveId,
            this.endBeat.voice.bar
        ));

        let startX: number = 0;
        let endX: number = 0;
        let startY: number = 0;
        let endY: number = 0;
        let shouldDraw: boolean = false;
        // if we are on the tie start, we check if we
        // either can draw till the end note, or we just can draw till the bar end
        this.tieDirection = !startNoteRenderer
            ? this.getBeamDirection(this.endBeat, endNoteRenderer!)
            : this.getBeamDirection(this.startBeat!, startNoteRenderer);
        if (!this.forEnd && startNoteRenderer) {
            // line break or bar break
            if (startNoteRenderer !== endNoteRenderer) {
                startX = cx + startNoteRenderer.x + this.getStartX();
                startY = cy + startNoteRenderer.y + this.getStartY() + this.yOffset;
                // line break: to bar end
                if (!endNoteRenderer || startNoteRenderer.staff !== endNoteRenderer.staff) {
                    endX = cx + startNoteRenderer.x + startNoteRenderer.width;
                    endY = startY;
                } else {
                    endX = cx + endNoteRenderer.x + this.getEndX();
                    endY = cy + endNoteRenderer.y + this.getEndY() + this.yOffset;
                }
            } else {
                startX = cx + startNoteRenderer.x + this.getStartX();
                endX = cx + endNoteRenderer.x + this.getEndX();
                startY = cy + startNoteRenderer.y + this.getStartY() + this.yOffset;
                endY = cy + endNoteRenderer.y + this.getEndY() + this.yOffset;
            }
            shouldDraw = true;
        } else if (!startNoteRenderer || startNoteRenderer.staff !== endNoteRenderer!.staff) {
            startX = cx + endNoteRenderer!.x;
            endX = cx + endNoteRenderer!.x + this.getEndX();
            startY = cy + endNoteRenderer!.y + this.getEndY() + this.yOffset;
            endY = startY;
            shouldDraw = true;
        }
        if (shouldDraw) {
            if(this.shouldDrawBendSlur()) {
                TieGlyph.drawBendSlur(
                    canvas,
                    startX,
                    startY,
                    endX,
                    endY,
                    this.tieDirection === BeamDirection.Down,
                    this.scale
                );
            }
            else {
                TieGlyph.paintTie(
                    canvas,
                    this.scale,
                    startX,
                    startY,
                    endX,
                    endY,
                    this.tieDirection === BeamDirection.Down,
                    this.getTieHeight(startX, startY, endX, endY),
                    4
                );
            }
        }
    }

    protected shouldDrawBendSlur() {
        return false;
    }

    protected getTieHeight(startX: number, startY: number, endX: number, endY: number): number {
        return 22;
    }

    protected getBeamDirection(beat: Beat, noteRenderer: BarRendererBase): BeamDirection {
        return BeamDirection.Down;
    }

    protected getStartY(): number {
        return 0;
    }

    protected getEndY(): number {
        return 0;
    }

    protected getStartX(): number {
        return 0;
    }

    protected getEndX(): number {
        return 0;
    }

    public static paintTie(
        canvas: ICanvas,
        scale: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean = false,
        offset: number = 22,
        size: number = 4
    ): void {
        if (x1 === x2 && y1 === y2) {
            return;
        }

        // ensure endX > startX
        if (x2 < x1) {
            let t: number = x1;
            x1 = x2;
            x2 = t;
            t = y1;
            y1 = y2;
            y2 = t;
        }

        //
        // calculate control points
        //
        offset *= scale;
        size *= scale;
        // normal vector
        let normalVectorX: number = y2 - y1;
        let normalVectorY: number = x2 - x1;
        let length: number = Math.sqrt(normalVectorX * normalVectorX + normalVectorY * normalVectorY);
        if (down) {
            normalVectorX *= -1;
        } else {
            normalVectorY *= -1;
        }
        // make to unit vector
        normalVectorX /= length;
        normalVectorY /= length;
        // center of connection
        let centerX: number = (x2 + x1) / 2;
        let centerY: number = (y2 + y1) / 2;
        // control points
        let cp1X: number = centerX + offset * normalVectorX;
        let cp1Y: number = centerY + offset * normalVectorY;
        let cp2X: number = centerX + (offset - size) * normalVectorX;
        let cp2Y: number = centerY + (offset - size) * normalVectorY;
        canvas.beginPath();
        canvas.moveTo(x1, y1);
        canvas.quadraticCurveTo(cp1X, cp1Y, x2, y2);
        canvas.quadraticCurveTo(cp2X, cp2Y, x1, y1);
        canvas.closePath();
        canvas.fill();
    }

    private static readonly BendSlurHeight: number = 11;

    public static drawBendSlur(
        canvas: ICanvas,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        down: boolean,
        scale: number,
        slurText?: string
    ): void {
        let normalVectorX: number = y2 - y1;
        let normalVectorY: number = x2 - x1;
        let length: number = Math.sqrt(normalVectorX * normalVectorX + normalVectorY * normalVectorY);
        if (down) {
            normalVectorX *= -1;
        } else {
            normalVectorY *= -1;
        }
        // make to unit vector
        normalVectorX /= length;
        normalVectorY /= length;
        // center of connection
        // TODO: should be 1/3
        let centerX: number = (x2 + x1) / 2;
        let centerY: number = (y2 + y1) / 2;
        let offset: number = TieGlyph.BendSlurHeight * scale;
        if (x2 - x1 < 20) {
            offset /= 2;
        }
        let cp1X: number = centerX + offset * normalVectorX;
        let cp1Y: number = centerY + offset * normalVectorY;
        canvas.beginPath();
        canvas.moveTo(x1, y1);
        canvas.lineTo(cp1X, cp1Y);
        canvas.lineTo(x2, y2);
        canvas.stroke();
        if (slurText) {
            let w: number = canvas.measureText(slurText);
            let textOffset: number = down ? 0 : -canvas.font.size;
            canvas.fillText(slurText, cp1X - w / 2, cp1Y + textOffset);
        }
    }
}
