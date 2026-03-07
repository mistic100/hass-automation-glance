import * as en from './translations/en.json';
import * as fr from './translations/fr.json';

const languages = {
    en,
    fr,
};

export function localize(hass, key, params = {}) {
    const lang = hass?.language ?? navigator.language.slice(0, 2);

    let translated;
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

export function localizeWeekday(hass, weekday) {
    const key = {
        fri: 'friday',
        mon: 'monday',
        sat: 'saturday',
        sun: 'sunday',
        thu: 'thursday',
        tue: 'tuesday',
        wed: 'wednesday',
    }[weekday];

    return hass.localize('ui.weekdays.' + key) ?? key;
}

export function localizeState(hass, state, entity) {
    if (['unknown', 'unavailable'].includes(state)) {
        return hass.localize('state.default.' + state);
    }

    if (!entity) {
        return state;
    }

    const domain = entity.entity_id.split('.')[0];
    const deviceClass = entity.device_class ?? '_';

    return hass.localize(`component.${domain}.entity_component.${deviceClass}.state.${state}`)
        || hass.localize(`component.${domain}.entity_component._.state.${state}`)
        || state;
}
