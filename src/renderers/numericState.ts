import { localize } from '../localize';
import { RenderFn } from '../types';
import { formatFor, getEntityName, isEntityId } from '../utils';

export const renderNumericState: RenderFn = (hass, trigger) => {
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
