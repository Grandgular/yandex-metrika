import { DeepPartial } from './deep-partial-interface';
import { YMConfig } from './ym-config-interfaces';

export type YMConfigOptional = { id: number } & DeepPartial<Omit<YMConfig, 'id'>>;
