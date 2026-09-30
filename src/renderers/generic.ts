import { RenderFn } from '../types';
import { castArray, formatFor, formatOffset, getEntityName, getEntityNameHex } from '../utils';

export const renderGeneric: RenderFn = (hass, trigger) => {
    let content = '';

    const entities: string[] = [
        ...castArray(trigger.target?.entity_id).map(entity_id => getEntityName(hass, entity_id!)),
        ...castArray(trigger.target?.device_id).map(device_id => getEntityNameHex(hass, device_id!)),
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

    if (trigger.options?.offset) {
        content += formatOffset(trigger.options.offset, trigger.options.offset_type === 'before');
    }

    if (trigger.options?.threshold) {
        content += ` ${trigger.options.threshold.type} `;

        content += [
            trigger.options.threshold.value,
            trigger.options.threshold.value_min,
            trigger.options.threshold.value_max,
        ]
            .filter(val => !!val)
            .map(val => {
                switch (val.active_choice) {
                    case 'number':
                        return val.number + (val.unit_of_measurement ?? '');
                    case 'entity':
                        return getEntityName(hass, val.entity!);
                    default:
                        return val.active_choice;
                }
            })
            .join(', ');
    }

    if (trigger.options?.for) {
        content += formatFor(hass, trigger.options.for);
    }

    if (trigger.options?.zone) {
        content += ` (${castArray(trigger.options.zone).map(zone => getEntityName(hass, zone)).join(', ')})`;
    }

    if (trigger.options?.option) {
        content += ` (${castArray(trigger.options.option).join(', ')})`;
    }

    return content;
}
