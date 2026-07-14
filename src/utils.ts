import { HomeAssistant } from 'custom-card-helpers';
import { localize } from './localize';
import { AutomationConfig } from './types';

export function getEntityName(hass: HomeAssistant, entityId: string): string {
    const entity = hass.states[entityId];
    if (entity) {
        return entity.attributes?.friendly_name ?? entityId;
    } else {
        return localize(hass, 'errors.unknownEntity', { entity: entityId });
    }
}

export function getEntityNameHex(hass: HomeAssistant, id: string): string {
    if (window.automationGlanceEntities[id]) {
        return getEntityName(hass, window.automationGlanceEntities[id]);
    } else {
        return localize(hass, 'errors.unknownEntity', { entity: id });
    }
}

export function listTriggerDomains(automation: AutomationConfig): string[] {
    const triggerDomains = automation.triggers
        .map(item => item.trigger)
        .filter(trigger => trigger.includes('.'))
        .map(trigger => trigger.split('.').shift() as string);

    return [...new Set(triggerDomains)];
}

export function listConditionsDomains(automation: AutomationConfig): string[] {
    const conditionDomains = automation.conditions
        .map(item => item.condition)
        .filter(condition => condition.includes('.'))
        .map(condition => condition.split('.').shift() as string);

    return [...new Set(conditionDomains)];
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

function formatTimeInternal(hours: number, minutes: number, seconds: number, forceSign: boolean): string {
    hours = hours ?? 0;
    const sign = hours < 0 ? '-' : (forceSign ? '+' : '');
    hours = Math.abs(hours);
    return `${sign}${leftPad(hours ?? 0, 2, '0')}:${leftPad(minutes ?? 0, 2, '0')}:${leftPad(seconds ?? 0, 2, '0')}`;
}

export function formatTime(time: string, forceSign = false, stripEmpty = false): string {
    const match = time.match(/^([-+]?[0-9]+):([0-9]+):([0-9]+)$/);
    if (!match) {
        return 'unknown';
    }
    const h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const s = parseInt(match[3]);
    if (!h && !m && !s && stripEmpty) {
        return '';
    }
    return formatTimeInternal(h, m, s, forceSign);
}

export function formatOffset(triggerOffset: string | { hours: number, minutes: number, seconds: number }): string {
    if (typeof triggerOffset === 'object') {
        if (!triggerOffset.hours && !triggerOffset.minutes && !triggerOffset.seconds) {
            return '';
        }
        return ' ' + formatTimeInternal(triggerOffset.hours, triggerOffset.minutes, triggerOffset.seconds, true);
    } else if (triggerOffset) {
        return ' ' + formatTime(triggerOffset, true, true);
    } else {
        return '';
    }
}

export function formatFor(hass: HomeAssistant, triggerFor: string | { hours: number, minutes: number, seconds: number }): string {
    if (typeof triggerFor === 'object') {
        if (!triggerFor.hours && !triggerFor.minutes && !triggerFor.seconds) {
            return '';
        }
        return localize(hass, 'triggers.for', {
            for: formatTimeInternal(triggerFor.hours, triggerFor.minutes, triggerFor.seconds, false)
        });
    } else if (triggerFor && !/^0+:0+:0+$/.test(triggerFor)) {
        return localize(hass, 'triggers.for', {
            for: formatTime(triggerFor)
        });
    } else {
        return '';
    }
}
