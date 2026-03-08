import { localize } from '../localize';
import { RenderFn } from '../types';
import { formatOffset } from '../utils';

export const renderSun: RenderFn = (hass, trigger) => {
    let content = '';

    // for triggers
    if (trigger.event) {
        content += localize(hass, 'triggers.sun.' + trigger.event);
        content += formatOffset(trigger.offset);
    }

    // for conditions
    if (trigger.after) {
        content += localize(hass, 'triggers.time.after', {
            after: localize(hass, 'triggers.sun.' + trigger.after),
        });
        content += formatOffset(trigger.after_offset);
    }
    if (trigger.before) {
        if (trigger.after) {
            content += localize(hass, 'triggers.and');
        }
        content += localize(hass, 'triggers.time.before', {
            before: localize(hass, 'triggers.sun.' + trigger.before),
        });
        content += formatOffset(trigger.before_offset);
    }

    return content;
}
