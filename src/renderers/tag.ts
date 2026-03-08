import { html } from 'lit';
import { RenderFn } from '../types';

export const renderTag: RenderFn = (hass, trigger) => {
    return html`<code>${trigger.tag_id}</code>`;
}
