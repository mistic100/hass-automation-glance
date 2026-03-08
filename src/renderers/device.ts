import { RenderFn } from '../types';
import { getEntityNameHex } from '../utils';

export const renderDevice: RenderFn = (hass, trigger) => {
    let content = getEntityNameHex(hass, trigger.entity_id);
    content += ': ';
    content += trigger.type;
    return content;
};
