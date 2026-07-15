import { RenderFn } from '../types';
import { castArray, formatFor, getEntityName, getEntityNameHex } from '../utils';

export const renderGeneric: RenderFn = (hass, trigger) => {
    let content = '';

    const entities: string[] = [
        ...castArray(trigger.target?.entity_id).map(entity_id => getEntityName(hass, entity_id)),
        ...castArray(trigger.target?.device_id).map(device_id => getEntityNameHex(hass, device_id)),
    ];
    if (entities.length) {
        content += entities.join(', ') + ': ' 
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
