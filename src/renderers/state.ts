import { html } from 'lit';
import { localizeState } from '../localize';
import { RenderFn } from '../types';
import { castArray, formatFor, getEntityName, isEntityId } from '../utils';

export const renderState: RenderFn = (hass, trigger) => {
    const entity = hass.states[trigger.entity_id];

    const localizeStates = (states: string | string[]) => {
        return castArray(states)
            .map(state => localizeState(hass, state, entity))
            .join(', ');
    };

    let content = html`${getEntityName(hass, trigger.entity_id)}`;

    if (trigger.attribute) {
        content = html`${content} [${trigger.attribute}]`;
    }

    content = html`${content}: `;

    // for triggers
    if (trigger.from) {
        content = html`${content} ${localizeStates(trigger.from)}`;
    } else if (trigger.not_from) {
        content = html`${content} <del>${localizeStates(trigger.not_from)}</del>`;
    }
    if ((trigger.from || trigger.not_from) && !trigger.to && !trigger.not_to) {
        content = html`${content} → ☆`;
    }
    if (!trigger.from && !trigger.not_from && (trigger.to || trigger.not_to)) {
        content = html`${content} ☆`
    }
    if (trigger.to) {
        content = html`${content} → ${localizeStates(trigger.to)}`;
    } else if (trigger.not_to) {
        content = html`${content} → <del>${localizeStates(trigger.not_to)}</del>`;
    }

    // for conditions
    if (trigger.state) {
        content = html`${content} ${
            castArray(trigger.state).map(state => {
                if (isEntityId(state)) {
                    return getEntityName(hass, state);
                } else {
                    return localizeState(hass, state, entity);
                }
            }).join(',')
        }`;
    }

    content = html`${content}${formatFor(hass, trigger.for)}`;

    return content;
}
