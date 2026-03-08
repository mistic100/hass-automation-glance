import { localize } from '../localize';
import { RenderFn } from '../types';
import { formatOffset, getEntityName } from '../utils';

export const renderCalendar: RenderFn = (hass, trigger) => {
    let content = getEntityName(hass, trigger.entity_id);
    content += ': ';
    content += localize(hass, 'triggers.calendar.' + trigger.event);
    content += formatOffset(trigger.offset);
    return content;
}
