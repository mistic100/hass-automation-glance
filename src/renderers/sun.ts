import { localize } from '../localize';
import { RenderFn } from '../types';
import { formatOffset } from '../utils';

export const renderSun: RenderFn = (hass, trigger) => {
    let content = '';

    // for triggers
    if (trigger.event) {
        content += hass.localize(`component.sun.triggers.${trigger.event}.name`);
        content += formatOffset(trigger.offset);
    }

    // for conditions
    if (trigger.after) {
        content += localize(hass, 'triggers.time.after', {
            after: hass.localize(`component.sun.triggers.${trigger.after}.name`),
        });
        content += formatOffset(trigger.after_offset);
    }
    if (trigger.before) {
        if (trigger.after) {
            content += localize(hass, 'triggers.and');
        }
        content += localize(hass, 'triggers.time.before', {
            before: hass.localize(`component.sun.triggers.${trigger.before}.name`),
        });
        content += formatOffset(trigger.before_offset);
    }

    return content;
}
