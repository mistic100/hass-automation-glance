import { HomeAssistant } from 'custom-card-helpers';
import { localize } from './localize';

export function getEntityName(hass: HomeAssistant, entityId: string): string {
    const entity = hass.states[entityId];
    if (entity) {
        return entity.attributes?.friendly_name ?? entityId;
    } else {
        return localize(hass, 'errors.unknownEntity', { entity: entityId });
    }
}

export function isEntityId(val: any): boolean {
    return typeof val === 'string' && val.split('.').length === 2;
}

export function leftPad(val: any, n: number, pad: string): string {
    return String(val).padStart(n, pad);
}

export function castArray<T>(val: T | T[]): T[] {
    return Array.isArray(val) ? val : (val ? [val] : []);
}

export function formatTime(time: string, forceSign = false, stripEmpty = false): string {
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

export function formatOffset(triggerOffset: string): string {
    if (triggerOffset) {
        return ` ${formatTime(triggerOffset, true, true)}`;
    } else {
        return '';
    }
}

export function formatFor(hass: HomeAssistant, triggerFor: any): string {
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
