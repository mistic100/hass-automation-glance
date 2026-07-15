import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';
import * as en from './translations/en.json';
import * as fr from './translations/fr.json';
import { AutomationConfig } from './types';
import { listConditionsDomains, listTriggerDomains } from './utils';

const languages: Record<string, any> = {
    en,
    fr,
};

/**
 * Used to access translations specific to the card
 */
export function localize(hass: HomeAssistant, key: string, params: Record<string, any> = {}): string {
    const lang = hass?.language ?? navigator.language.slice(0, 2);

    let translated: string;
    try {
        translated = key.split('.').reduce((k, i) => k[i], languages[lang]);
    } catch {
        try {
            translated = key.split('.').reduce((k, i) => k[i], languages['en']);
        } catch {
            console.warn(`Missing translation for ${key}`);
            translated = key;
        }
    }

    Object.entries(params).forEach(([search, replace]) => {
        translated = translated.replace(new RegExp(`\\{${search}\\}`), replace);
    });

    return translated;
}

export function localizeWeekday(hass: HomeAssistant, weekday: string): string {
    const key = {
        mon: 'monday',
        tue: 'tuesday',
        wed: 'wednesday',
        thu: 'thursday',
        fri: 'friday',
        sat: 'saturday',
        sun: 'sunday',
    }[weekday];

    return hass.localize('ui.weekdays.' + key) ?? key;
}

export function localizeState(hass: HomeAssistant, state: string, entity: HassEntity): string {
    if (['unknown', 'unavailable'].includes(state)) {
        return hass.localize('state.default.' + state);
    }

    if (!entity) {
        return state;
    }

    const domain = entity.entity_id.split('.')[0];
    const deviceClass = entity.attributes?.device_class ?? '_';

    return hass.localize(`component.${domain}.entity_component.${deviceClass}.state.${state}`)
        || hass.localize(`component.${domain}.entity_component._.state.${state}`)
        || state;
}

type CAT = 'trigger' | 'condition';

const loadedTranslations: Record<CAT, Record<string, boolean>> = {
    trigger: {},
    condition: {},
};

/**
 * Load triggers and conditions translations
 */
export async function loadTranslations(hass: HomeAssistant, automation: AutomationConfig, showConditions: boolean) {
    const toLoad: Record<CAT, string[]> = {
        trigger: [],
        condition: [],
    };

    toLoad.trigger = listTriggerDomains(automation).filter(domain => !loadedTranslations.trigger[domain]);
    if (showConditions) {
        toLoad.condition = listConditionsDomains(automation).filter(domain => !loadedTranslations.condition[domain]);
    }

    for (let [category, integrations] of Object.entries(toLoad)) {
        if (integrations.length) {
            // console.log(`Load translations ${category} ${integrations}`);
            
            for (const integration of integrations) {
                // @ts-ignore
                await hass.loadBackendTranslation(category + 's', integration);
                loadedTranslations[category as CAT][integration] = true;
            }
        }
    }
}
