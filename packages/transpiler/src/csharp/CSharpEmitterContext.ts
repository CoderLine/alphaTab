import EmitterContextBase from '../EmitterContextBase';

/**
 * C#-specific emitter context. Currently empty — future C#-only
 * state and overrides land here without re-introducing a refactor.
 * Kept as a real subclass per Backlog-14 OOP-separation principle.
 */
export default class CSharpEmitterContext extends EmitterContextBase {}
