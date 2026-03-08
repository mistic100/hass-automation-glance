import { HomeAssistant } from 'custom-card-helpers';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { localize } from '../localize';
import { renderCalendar } from '../renderers/calendar';
import { renderConversation } from '../renderers/conversation';
import { renderEvent } from '../renderers/event';
import { renderNumericState } from '../renderers/numericState';
import { renderState } from '../renderers/state';
import { renderSun } from '../renderers/sun';
import { renderTag } from '../renderers/tag';
import { renderTemplate } from '../renderers/template';
import { renderTime } from '../renderers/time';
import { renderTimePattern } from '../renderers/timePattern';
import { renderTrigger } from '../renderers/trigger';
import { renderZone } from '../renderers/zone';
import { AutomationCondition, AutomationConfig, AutomationGlanceConfig, AutomationTrigger, RenderFn } from '../types';

const ICONS: Record<string, string> = {
    _: 'mdi:robot',
    and: 'mdi:ampersand',
    not: 'mdi:not-equal-variant',
    or: 'mdi:gate-or',

    calendar: 'mdi:calendar',
    conversation: 'mdi:forum-outline',
    device: 'mdi:devices',
    event: 'mdi:gesture-double-tap',
    numeric_state: 'mdi:numeric',
    state: 'mdi:state-machine',
    sun: 'mdi:weather-sunny',
    tag: 'mdi:nfc-variant',
    template: 'mdi:code-braces',
    time_pattern: 'mdi:av-timer',
    time: 'mdi:clock-outline',
    trigger: 'mdi:identifier',
    webhook: 'mdi:webhook',
    zone: 'mdi:map-marker-radius',
};

const RENDERERS: Record<string, RenderFn> = {
    _: (hass, trigger) => localize(hass, 'errors.unsupportedDomain', { domain: trigger.trigger ?? trigger.condition }),
    calendar: renderCalendar,
    conversation: renderConversation,
    event: renderEvent,
    numeric_state: renderNumericState,
    state: renderState,
    sun: renderSun,
    tag: renderTag,
    template: renderTemplate,
    time_pattern: renderTimePattern,
    time: renderTime,
    trigger: renderTrigger,
    webhook: () => '',
    zone: renderZone,
};


class AbstractAutomationBadges extends LitElement {

    @property({ attribute: false }) public hass: HomeAssistant;
    @property({ attribute: false }) public config: AutomationGlanceConfig;
    @property({ attribute: false }) public automation: AutomationConfig;

    static styles = css`
        :host {
            display: flex;
            flex-wrap: wrap;
            gap: var(--ha-space-2);
            padding: var(--ha-space-2);
            background: var(--primary-background-color);
            border-width: var(--ha-card-border-width, 1px);
            border-style: solid;
            border-color: var(--ha-card-border-color,var(--divider-color, #e0e0e0));
            border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg));
        }

        .trigger-id {
            position: absolute;
            top: -0.5em;
            left: -0.5em;
            background: var(--accent-color);
            color: var(--text-primary-color);
            border-radius: 50vh;
            font-size: var(--ha-font-size-s);
            padding: 0.05em 0.3em;
            z-index: 1;
        }

        ha-badge {
            --ha-font-weight-medium: normal;

            ha-icon {
                margin-left: -4px;

                &:last-child {
                    margin-right: -4px;
                }
            }
        }

        ha-tooltip {
            --max-width: none;
        }
    `;

    renderBadge(data: AutomationTrigger | AutomationCondition, id: string): ReturnType<typeof html> {
        const badgeId = `${this.automation.id}-${id}`;
        const icon = ICONS[data.trigger ?? data.condition] ?? ICONS._;
        const content = data.alias ?? (RENDERERS[data.trigger ?? data.condition] ?? RENDERERS._)(this.hass, data);

        return html`
            <ha-badge
                id=${badgeId}
                .type="badge"
            >
                ${data.trigger && data.id && this.config.showId ? html`<code class="trigger-id">${data.id}</code>` : ''}

                <ha-icon .icon=${icon}></ha-icon>

                ${content ? html`<span>${content}</span>` : ''}
            </ha-badge>
            ${this.config.showTooltip
                ? html`
                <ha-tooltip .for=${badgeId}>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                </ha-tooltip>
            ` : ''}
        `;
    }
}


@customElement('automation-glance-triggers')
export class AutomationGlanceTriggers extends AbstractAutomationBadges {
    render() {
        if (!this.hass || !this.config || !this.automation) {
            return nothing;
        }

        return this.automation.triggers
            .filter(trigger => trigger.enabled !== false)
            .flatMap(trigger => {
                if (trigger.alias) {
                    return trigger;
                }
                if (trigger.entity_id && Array.isArray(trigger.entity_id)) {
                    return trigger.entity_id.map(entity_id => ({ ...trigger, entity_id }));
                }
                if (trigger.trigger === 'time' && Array.isArray(trigger.at)) {
                    return trigger.at.map(at => ({ ...trigger, at }));
                }
                if (trigger.trigger === 'conversation' && Array.isArray(trigger.command)) {
                    return trigger.command.map(command => ({ ...trigger, command }));
                }
                if (trigger.trigger === 'event' && Array.isArray(trigger.event_type)) {
                    return trigger.event_type.map(event_type => ({ ...trigger, event_type }));
                }
                if (trigger.trigger === 'tag' && Array.isArray(trigger.tag_id)) {
                    return trigger.tag_id.map(tag_id => ({ ...trigger, tag_id }));
                }
                return trigger;
            })
            .map((trigger, i) => this.renderBadge(trigger, `trigger-${i}`));
    }
}


@customElement('automation-glance-conditions')
export class AutomationGlanceConditions extends AbstractAutomationBadges {
    static styles = css`
        ${super.styles}

        :host {
            margin-top: var(--ha-space-2);
            background: repeating-linear-gradient(
                45deg,
                var(--primary-background-color),
                var(--primary-background-color) 10px,
                var(--card-background-color) 10px,
                var(--card-background-color) 20px
            );
        }

        .bloc {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--ha-space-2);
            padding: var(--ha-space-1);
            border-width: var(--ha-card-border-width, 1px);
            border-style: solid;
            border-color: var(--ha-card-border-color,var(--divider-color, #e0e0e0));
            border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg));
        }

        .leading-icon-wrapper {
            background-color: var(--ha-color-fill-neutral-loud-resting);
            border-radius: var(--ha-border-radius-md);
            padding: var(--ha-space-1);
            display: flex;
            justify-content: center;
            align-items: center;
            transform: rotate(45deg);

            ha-icon {
                --mdc-icon-size: 18px;
                transform: rotate(-45deg);
                line-height: 1;
            }
        }
    `;

    render() {
        if (!this.hass || !this.config || !this.automation) {
            return nothing;
        }

        return this.renderConditions(this.automation.conditions);
    }

    renderConditions(conditions: AutomationCondition[], rootId = 'cond'): ReturnType<typeof html>[] {
        return conditions
            .filter(condition => condition.enabled !== false)
            .flatMap(condition => {
                if (condition.alias) {
                    return condition;
                }
                if (condition.entity_id && Array.isArray(condition.entity_id)) {
                    return condition.entity_id.map(entity_id => ({ ...condition, entity_id }));
                }
                if (condition.condition === 'trigger' && Array.isArray(condition.id)) {
                    return condition.id.map(id => ({ ...condition, id }));
                }
                return condition;
            })
            .map((condition: AutomationCondition, i: number) => {
                const id = `${rootId}-${i}`;
                if (['and', 'or', 'not'].includes(condition.condition)) {
                    const icon = ICONS[condition.condition];

                    return html`
                        <div class="bloc">
                            <div class="leading-icon-wrapper">
                                <ha-icon .icon=${icon}></ha-icon>
                            </div>
                            ${this.renderConditions(condition.conditions, id)}
                        </div>
                    `;
                } else {
                    return this.renderBadge(condition, id);
                }
            });
    }
}
