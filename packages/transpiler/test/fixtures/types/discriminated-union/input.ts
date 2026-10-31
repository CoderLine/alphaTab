/**
 * A discriminated union for shape commands.
 * @discriminated kind shape.
 * @public
 */
export type ShapeCommand =
    | { kind: 'shape.circle'; radius: number }
    | { kind: 'shape.rect'; width: number; height: number }
    | { kind: 'shape.point' };

/**
 * @public
 */
export class ShapeProcessor {
    public describe(cmd: ShapeCommand): string {
        switch (cmd.kind) {
            case 'shape.circle':
                return 'circle';
            case 'shape.rect':
                return 'rect';
            default:
                return 'point';
        }
    }

    public makeCircle(): ShapeCommand {
        return { kind: 'shape.circle', radius: 5 };
    }

    public makeRect(): ShapeCommand {
        return { kind: 'shape.rect', width: 10, height: 20 };
    }

    public makePoint(): ShapeCommand {
        return { kind: 'shape.point' };
    }
}
