import { RenderFn } from '../types';
import { castArray, formatFor, getEntityName } from '../utils';

export const renderGeneric: RenderFn = (hass, trigger) => {
    let content = '';

    if (trigger.target?.entity_id) {
        content = castArray(trigger.target.entity_id).map(entity_id => getEntityName(hass, entity_id)).join(', ') + ': ' 
    }

    if (trigger.trigger) {
        const [domain, event] = trigger.trigger.split('.');
        content += hass.localize(`component.${domain}.triggers.${event}.name`);
    }

    if (trigger.condition) {
        const [domain, event] = trigger.condition.split('.');
        content += hass.localize(`component.${domain}.conditions.${event}.name`);
    }

    if (trigger.options?.for) {
        content += formatFor(hass, trigger.options.for);
    }

    if (trigger.options?.zone) {
        content += ` (${getEntityName(hass, trigger.options.zone)})`;
    }

    return content;
}
