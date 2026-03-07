import { html } from 'lit';
import { localize, localizeState, localizeWeekday } from './localize';

function getEntityName(hass, entityId) {
    const entity = hass.states[entityId];
    if (entity) {
        return entity.attributes?.friendly_name ?? entityId;
    } else {
        return localize(hass, 'errors.unknownEntity', { entity: entityId });
    }
}

function leftPad(val, n, pad) {
    return String(val).padStart(n, pad);
}

function castArray(val) {
    return Array.isArray(val) ? val : (val ? [val] : []);
}

function formatTime(time, forceSign = false, stripEmpty = false) {
    const match = time.match(/^([-+]?)([0-9]+):([0-9]+):([0-9]+)$/);
    if (!match) {
        return 'unknown';
    }
    const sign = match[1] || (forceSign ? '+' : '');
    const h = parseInt(match[2]);
    const m = parseInt(match[3]);
    const s = parseInt(match[4]);
    if (!h && !m && !s && stripEmpty) {
        return '';
    }
    return `${sign}${leftPad(h, 2, '0')}:${leftPad(m, 2, '0')}:${leftPad(s, 2, '0')}`;
}

function formatOffset(triggerOffset) {
    if (triggerOffset) {
        return ` ${formatTime(triggerOffset, true, true)}`;
    } else {
        return '';
    }
}

function formatFor(hass, triggerFor) {
    if (typeof triggerFor === 'object') {
        return localize(hass, 'triggers.for', {
            for: `${leftPad(triggerFor.hours ?? 0, 2, '0')}:${leftPad(triggerFor.minutes ?? 0, 2, '0')}:${leftPad(triggerFor.seconds ?? 0, 2, '0')}`
        });
    } else if (triggerFor) {
        return localize(hass, 'triggers.for', {
            for: formatTime(triggerFor)
        });
    } else {
        return '';
    }
}

function isEntityId(val) {
    return typeof val === 'string' && val.split('.').length === 2;
}

export function renderTime(hass, trigger) {
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

export function renderTimePattern(hass, trigger) {
    return `${trigger.hours ?? '*'} ${trigger.minutes ?? '*'} ${trigger.seconds ?? '*'}`;
}

export function renderState(hass, trigger) {
    const entity = hass.states[trigger.entity_id];

    const localizeStates = (states) => {
        return castArray(states)
            .map(state => localizeState(hass, state, entity))
            .join(', ');
    };

    let content = getEntityName(hass, trigger.entity_id);

    if (trigger.attribute) {
        content += ` [${trigger.attribute}]`;
    }

    content+= ': ';

    // for triggers
    if (trigger.from) {
        content = html`${content} ${localizeStates(trigger.from)}`;
    } else if (trigger.not_from) {
        content = html`${content} <del>${localizeStates(trigger.not_from)}</del>`;
    }
    if ((trigger.from || trigger.not_from) && !trigger.to && !trigger.not_to) {
        content = html`${content} → ☆`;
    }
    if (!trigger.from && !trigger.not_from && (trigger.to || trigger.not_to)) {
        content = html`${content} ☆`
    }
    if (trigger.to) {
        content = html`${content} → ${localizeStates(trigger.to)}`;
    } else if (trigger.not_to) {
        content = html`${content} → <del>${localizeStates(trigger.not_to)}</del>`;
    }

    // for conditions
    if (trigger.state) {
        content = html`${content} ${
            castArray(trigger.state).map(state => {
                if (isEntityId(state)) {
                    return getEntityName(hass, state);
                } else {
                    return localizeState(hass, state, entity);
                }
            }).join(',')
        }`;
    }

    content = html`${content}${formatFor(hass, trigger.for)}`;

    return content;
}

export function renderNumericState(hass, trigger) {
    let content = getEntityName(hass, trigger.entity_id);

    if (trigger.attribute) {
        content += ` [${trigger.attribute}]`;
    } else if (trigger.value_template) {
        content += ' {...}';
    }

    content+= ': ';

    if (trigger.above) {
        if (isEntityId(trigger.above)) {
            content += localize(hass, 'triggers.numeric_state.above', {
                above: getEntityName(hass, trigger.above)
            }); 
        } else {
            content += localize(hass, 'triggers.numeric_state.above', {
                above: trigger.above
            });
        }
    }
    if (trigger.below) {
        if (trigger.above) {
            content += localize(hass, 'triggers.and');
        }
        if (isEntityId(trigger.below)) {
            content += localize(hass, 'triggers.numeric_state.below', {
                below: getEntityName(hass, trigger.below)
            }); 
        } else {
            content += localize(hass, 'triggers.numeric_state.below', {
                below: trigger.below
            });
        }
    }

    content += formatFor(hass, trigger.for);

    return content;
}

export function renderTemplate(hass, trigger) {
    return `{...} ${formatFor(hass, trigger.for)}`;
}

export function renderSun(hass, trigger) {
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

export function renderConversation(hass, trigger) {
    return `« ${trigger.command} »`;
}

export function renderTrigger(hass, condition) {
    return html`<code>${condition.id}</code>`;
}

export function renderCalendar(hass, trigger) {
    let content = getEntityName(hass, trigger.entity_id);
    content += ': ';
    content += localize(hass, 'triggers.calendar.' + trigger.event);
    content += formatOffset(trigger.offset);
    return content;
}

export function renderZone(hass, trigger) {
    const person = getEntityName(hass, trigger.entity_id);
    const zone = getEntityName(hass, trigger.zone);

    // for triggers
    if (trigger.event) {
        return localize(hass, 'triggers.zone.' + trigger.event, {
            person,
            zone,
        });
    }

    // for conditions
    if (trigger.condition) {
        return localize(hass, 'triggers.zone.in', {
            person,
            zone,
        });
    }

    return '';
}

export function renderEvent(hass, trigger) {
    return html`<code>${trigger.event_type}</code>`;
}

export function renderTag(hass, trigger) {
    return html`<code>${trigger.tag_id}</code>`;
}
