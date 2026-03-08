import { RenderFn } from '../types';
import { formatFor } from '../utils';

export const renderTemplate: RenderFn = (hass, trigger) => {
    return `{...}${formatFor(hass, trigger.for)}`;
}
