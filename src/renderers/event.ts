import { html } from 'lit';
import { RenderFn } from '../types';

export const renderEvent: RenderFn = (hass, trigger) => {
    return html`<code>${trigger.event_type}</code>`;
}
