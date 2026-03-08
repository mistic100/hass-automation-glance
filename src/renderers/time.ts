import { localize, localizeWeekday } from '../localize';
import { RenderFn } from '../types';
import { castArray, formatOffset, formatTime, getEntityName, isEntityId } from '../utils';

export const renderTime: RenderFn = (hass, trigger) => {
    let content = '';

    // for triggers
    if (trigger.at) {
        if (typeof trigger.at === 'object') {
            content = getEntityName(hass, trigger.at.entity_id) + formatOffset(trigger.at.offset);
        } else if (isEntityId(trigger.at)) {
            content = getEntityName(hass, trigger.at);
        } else {
            content = formatTime(trigger.at);
        }
    }

    // for conditions
    if (trigger.after) {
        if (isEntityId(trigger.after)) {
            content += localize(hass, 'triggers.time.after', {
                after: getEntityName(hass, trigger.after)
            });
        } else {
            content += localize(hass, 'triggers.time.after', {
                after: formatTime(trigger.after)
            });
        }
    }
    if (trigger.before) {
        if (trigger.after) {
            content += localize(hass, 'triggers.and');
        }
        if (isEntityId(trigger.before)) {
            content += localize(hass, 'triggers.time.before', {
                before: getEntityName(hass, trigger.before)
            });
        } else {
            content += localize(hass, 'triggers.time.before', {
                before: formatTime(trigger.before)
            });
        }
    }

    if (trigger.weekday) {
        content += ` (${
            castArray(trigger.weekday)
                .map(weekday => localizeWeekday(hass, weekday))
                .join(', ')
        })`;
    }

    return content;
}
