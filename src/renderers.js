import { html } from 'lit';

function getEntityName(hass, entityId) {
    const entity = hass.states[entityId];
    if (entity) {
        return entity.attributes?.friendly_name ?? entityId;
    } else {
        txt = `Unknown entity ${entityId}`;
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

function formatFor(triggerFor) {
    if (typeof triggerFor === 'object') {
        return ` for ${leftPad(triggerFor.hours ?? 0, 2, '0')}:${leftPad(triggerFor.minutes ?? 0, 2, '0')}:${leftPad(triggerFor.seconds ?? 0, 2, '0')}`;
    } else if (triggerFor) {
        return ` for ${formatTime(triggerFor)}`;
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
            content += `After ${getEntityName(hass, trigger.after)}`;
        } else {
            content += `After ${formatTime(trigger.after)}`;
        }
    }
    if (trigger.before) {
        if (trigger.after) {
            content += ' and ';
        }
        if (isEntityId(trigger.before)) {
            content += `Before ${getEntityName(hass, trigger.before)}`;
        } else {
            content += `Before ${formatTime(trigger.before)}`;
        }
    }

    if (Array.isArray(trigger.weekday)) {
        content += ` (${trigger.weekday.join(', ')})`;
    } else if (trigger.weekday) {
        content += ` (${trigger.weekday})`;
    }

    return content;
}

export function renderTimePattern(hass, trigger) {
    return `${trigger.hours ?? '*'} ${trigger.minutes ?? '*'} ${trigger.seconds ?? '*'}`;
}

export function renderState(hass, trigger) {
    let content = getEntityName(hass, trigger.entity_id);

    if (trigger.attribute) {
        content += ` [${trigger.attribute}]`;
    }

    // for triggers
    if (trigger.from) {
        content = html`${content}: ${castArray(trigger.from).join(',')}`;
    } else if (trigger.not_from) {
        content = html`${content}: <del>${castArray(trigger.not_from).join(',')}</del>`;
    }
    if ((trigger.from || trigger.not_from) && !trigger.to && !trigger.not_to) {
        content = html`${content} → ☆`;
    }
    if (!trigger.from && !trigger.not_from && (trigger.to || trigger.not_to)) {
        content = html`${content}: ☆`
    }
    if (trigger.to) {
        content = html`${content} → ${castArray(trigger.to).join(',')}`;
    } else if (trigger.not_to) {
        content = html`${content} → <del>${castArray(trigger.not_to).join(',')}</del>`;
    }

    // for conditions
    if (trigger.state) {
        content = html`${content}: ${castArray(trigger.state).map(state => {
            if (isEntityId(state)) {
                return getEntityName(hass, state);
            } else {
                return state;
            }
        }).join(',')}`;
    }

    content = html`${content}${formatFor(trigger.for)}`;

    return content;
}

export function renderNumericState(hass, trigger) {
    let content = getEntityName(hass, trigger.entity_id);

    if (trigger.attribute) {
        content += ` [${trigger.attribute}]`;
    } else if (trigger.value_template) {
        content += ' {tpl}';
    }

    if (trigger.above) {
        if (typeof trigger.above === 'number') {
            content += `: above ${trigger.above}`;
        } else {
            content += `: above ${getEntityName(hass, trigger.above)}`;
        }
    }
    if (trigger.below) {
        if (trigger.above) {
            content += ' and';
        } else {
            content += ':';
        }
        if (typeof trigger.below === 'number') {
            content += ` below ${trigger.below}`;
        } else {
            content += ` below ${getEntityName(hass, trigger.below)}`;
        }
    }

    content += formatFor(trigger.for);

    return content;
}

export function renderSun(hass, trigger) {
    let content = '';

    // for triggers
    if (trigger.event) {
        return trigger.event + formatOffset(trigger.offset);
    }

    // for conditions
    if (trigger.after) {
        content += `After ${trigger.after}${formatOffset(trigger.after_offset)}`;
    }
    if (trigger.before) {
        if (trigger.after) {
            content += ' and ';
        }
        content += `Before ${trigger.before}${formatOffset(trigger.before_offset)}`;
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
    return `${getEntityName(hass, trigger.entity_id)}: event ${trigger.event}${formatOffset(trigger.offset)}`;
}

export function renderZone(hass, trigger) {
    let content = getEntityName(hass, trigger.entity_id);

    // for triggers
    if (trigger.event) {
        content += ` ${trigger.event}`;
    }

    // for conditions
    if (trigger.condition) {
        content += ' in';
    }

    content += ` ${getEntityName(hass, trigger.zone)}`;

    return content;
}
