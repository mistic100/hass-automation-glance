import { localize } from '../localize';
import { RenderFn } from '../types';
import { getEntityName } from '../utils';

export const renderZone: RenderFn = (hass, trigger) => {
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
