import { HomeAssistant } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';
import * as en from './translations/en.json';
import * as fr from './translations/fr.json';

const languages: Record<string, any> = {
    en,
    fr,
};

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
