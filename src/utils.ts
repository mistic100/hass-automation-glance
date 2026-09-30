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
    if (window.automationGlanceEntities?.[id]) {
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

function formatTime(days: number, hours: number, minutes: number, seconds: number, opt?: {
    forceSign?: boolean,
    forceNegative?: boolean,
}): string {
    let result = opt?.forceSign ? '+' : '';
    if (opt?.forceNegative || days < 0 || hours < 0 || minutes < 0 || seconds < 0) {
        result = '-';
    }
    if (days) {
        result += `${Math.abs(days)}d `;
    }
    if (hours || minutes || seconds) {
        result += `${leftPad(Math.abs(hours), 2, '0')}:${leftPad(Math.abs(minutes), 2, '0')}:${leftPad(Math.abs(seconds), 2, '0')}`;
    }
    return result;
}

export function formatOffset(triggerOffset: string | { days?: number, hours?: number, minutes?: number, seconds?: number }, forceNegative = false): string {
    if (typeof triggerOffset === 'object') {
        if (!triggerOffset.days && !triggerOffset.hours && !triggerOffset.minutes && !triggerOffset.seconds) {
            return '';
        }
        return ' ' + formatTime(triggerOffset.days ?? 0, triggerOffset.hours ?? 0, triggerOffset.minutes ?? 0, triggerOffset.seconds ?? 0, {
            forceSign: true,
            forceNegative,
        });
    } else if (triggerOffset) {
        return ' ' + (!['+', '-'].includes(triggerOffset[0]) ? '+' : '') + triggerOffset;
    } else {
        return '';
    }
}

export function formatFor(hass: HomeAssistant, triggerFor: string | { hours?: number, minutes?: number, seconds?: number }): string {
    if (typeof triggerFor === 'object') {
        if (!triggerFor.hours && !triggerFor.minutes && !triggerFor.seconds) {
            return '';
        }
        return localize(hass, 'triggers.for', {
            for: formatTime(0, triggerFor.hours ?? 0, triggerFor.minutes ?? 0, triggerFor.seconds ?? 0)
        });
    } else if (triggerFor && !/^0+:0+:0+$/.test(triggerFor)) {
        return localize(hass, 'triggers.for', {
            for: triggerFor,
        });
    } else {
        return '';
    }
}
