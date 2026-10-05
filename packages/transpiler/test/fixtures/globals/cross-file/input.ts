import { type Info, countDown, createCheck, defaultInfo } from './rendering/infos';

/**
 * @internal
 */
export class Registry {
    public infos: Info[] = [defaultInfo, { id: 'custom', check: createCheck(5) }];

    public steps(): number {
        return countDown(10);
    }
}
