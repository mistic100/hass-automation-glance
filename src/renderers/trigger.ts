import { html } from 'lit';
import { RenderFn } from '../types';

export const renderTrigger: RenderFn = (hass, trigger) => {
    return html`<code>${trigger.id}</code>`;
}
