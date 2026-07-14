import { HomeAssistant } from 'custom-card-helpers';
import { AutomationConfig } from './types';
import { listConditionsDomains, listTriggerDomains } from './utils';

/**
 * Icons for "old" triggers and conditions
 */
export const ICONS: Record<string, string> = {
    _: 'mdi:robot',
    and: 'mdi:ampersand',
    not: 'mdi:not-equal-variant',
    or: 'mdi:gate-or',

    calendar: 'mdi:calendar',
    conversation: 'mdi:forum-outline',
    device: 'mdi:devices',
    event: 'mdi:gesture-double-tap',
    numeric_state: 'mdi:numeric',
    state: 'mdi:state-machine',
    sun: 'mdi:weather-sunny',
    tag: 'mdi:nfc-variant',
    template: 'mdi:code-braces',
    time_pattern: 'mdi:av-timer',
    time: 'mdi:clock-outline',
    trigger: 'mdi:identifier',
    webhook: 'mdi:webhook',
    zone: 'mdi:map-marker-radius',
};


type CAT = 'trigger' | 'condition';

const loadedIcons: Record<CAT, Record<string, Record<string, Record<CAT, string>>>> = {
    trigger: {},
    condition: {},
};

/**
 * Load triggers and conditions icons
 */
export async function loadIcons(hass: HomeAssistant, automation: AutomationConfig, showConditions: boolean) {
    const toLoad: Record<CAT, string[]> = {
        trigger: [],
        condition: [],
    };

    toLoad.trigger = listTriggerDomains(automation).filter(domain => !loadedIcons.trigger[domain]);
    if (showConditions) {
        toLoad.condition = listConditionsDomains(automation).filter(domain => !loadedIcons.trigger[domain]);
    }

    for (let [category, integrations] of Object.entries(toLoad)) {
        if (integrations.length) {
            // console.log(`Load icons ${category} ${integrations}`);

            const result = await hass.callWS<{ resources: any }>({
                type: 'frontend/get_icons',
                category: category + 's',
                integration: integrations,
            });

            Object.assign(loadedIcons[category as CAT], result.resources);
        }
    }
}

export function getIcon(cat: CAT, domain: string, code: string): string {
    return loadedIcons[cat][domain]?.[code]?.[cat] ?? ICONS._;
}
