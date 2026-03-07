import { LitElement, css, html, nothing } from 'lit';
import { version } from '../package.json';
import { localize } from './localize';
import {
    renderCalendar,
    renderConversation,
    renderEvent,
    renderNumericState,
    renderState,
    renderSun,
    renderTag,
    renderTemplate,
    renderTime,
    renderTimePattern,
    renderTrigger,
    renderZone,
} from './renderers.js';

const TRIGGERS_ICON = {
    _: 'mdi:robot',
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

const TRIGGERS_RENDERERS = {
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
    static properties = {
        hass: { attribute: false },
        config: { attribute: false },
        automation: { attribute: false },
    };

    static styles = css`
        :host {
            display: flex;
            gap: var(--ha-space-2);
            padding: var(--ha-space-2);
            flex-wrap: wrap;
            background: var(--primary-background-color);
            border-width: var(--ha-card-border-width, 1px);
            border-style: solid;
            border-color: var(--ha-card-border-color,var(--divider-color, #e0e0e0));
            border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg));
        }

        ha-icon {
            margin-left: -4px;

            &:last-child {
                margin-right: -4px;
            }
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
        }

        ha-tooltip {
            --max-width: none;
        }
    `;

    renderBadge(data, index) {
        const triggerId = `trigger-${this.automation.id}${index}`;
        const icon = TRIGGERS_ICON[data.trigger ?? data.condition] ?? TRIGGERS_ICON._;
        const content = data.alias ?? (TRIGGERS_RENDERERS[data.trigger ?? data.condition] ?? TRIGGERS_RENDERERS._)(this.hass, data);

        return html`
            <ha-badge
                id=${triggerId}
                .type="badge"
            >
                ${data.trigger && data.id && this.config.showId ? html`<code class="trigger-id">${data.id}</code>` : ''}

                <ha-icon .icon=${icon}></ha-icon>

                ${content ? html`<span>${content}</span>` : ''}
            </ha-badge>
            ${this.config.showTooltip
                ? html`
                <ha-tooltip .for=${triggerId}>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                </ha-tooltip>
            ` : ''}
        `;
    }
}

class AutomationGlanceTriggers extends AbstractAutomationBadges {
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
            .map((trigger, i) => this.renderBadge(trigger, i));
    }
}
customElements.define('automation-glance-triggers', AutomationGlanceTriggers);

class AutomationGlanceConditions extends AbstractAutomationBadges {
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
    `;

    render() {
        if (!this.hass || !this.config || !this.automation) {
            return nothing;
        }

        return this.automation.conditions
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
            .map((condition, i) => this.renderBadge(condition, i))
    }
}
customElements.define('automation-glance-conditions', AutomationGlanceConditions);

class AutomationGlanceItem extends LitElement {
    static properties = {
        hass: { attribute: false },
        config: { attribute: false },
        entityId: { type: String },
        _automation: { state: true },
        _error: { state: true },
    };

    #currentId = null;

    static styles = css`
        :host {
            display: block;
        }

        .description {
            color: var(--secondary-text-color);
            margin-bottom: var(--ha-space-2);
        }
    `;

    render() {
        if (!this.hass || !this.config || !this.entityId) {
            return nothing;
        }

        const stateObj = this.hass.states[this.entityId];

        return html`
            <hui-generic-entity-row
                .hass=${this.hass}
                .config=${{ entity: this.entityId }}
            >
                ${this.config.showToggle
                ? html`
                    <ha-entity-toggle
                        .hass=${this.hass}
                        .stateObj=${stateObj}
                    ></ha-entity-toggle>
                ` : ''}
            </hui-generic-entity-row>

            ${this._error
                ? html`
                <ha-alert alert-type="error">
                    ${this._error}
                </ha-alert>
            ` : ''}

            ${this._automation
                ? html`
                ${this._automation.description && this.config.showDescription
                        ? html`
                    <div class="description">
                        <ha-markdown .content=${this._automation.description}></ha-markdown>
                    </div>
                ` : ''}

                <automation-glance-triggers
                    .hass=${this.hass}
                    .config=${this.config}
                    .automation=${this._automation}
                ></automation-glance-triggers>

                ${this._automation.conditions?.length && this.config.showConditions
                        ? html`
                    <automation-glance-conditions
                        .hass=${this.hass}
                        .config=${this.config}
                        .automation=${this._automation}
                    ></automation-glance-conditions>
                ` : ''}
            ` : ''}
        `;
    }

    updated() {
        if (!this.hass || !this.entityId) {
            return;
        }

        this.#getAutomationConfig();
    }

    async #getAutomationConfig() {
        if (this.entityId === this.#currentId) {
            return;
        }

        try {
            const result = await this.hass.callWS({
                type: 'automation/config',
                entity_id: this.entityId
            });

            this._automation = result.config;
            this._error = null;
            this.#currentId = this.entityId;

        } catch (err) {
            console.error(err);
            this._error = localize(this.hass, 'errors.fetchError');
            this._automation = null;
        }
    }
}
customElements.define('automation-glance-item', AutomationGlanceItem);

class AutomationGlanceCard extends LitElement {
    static properties = {
        hass: { attribute: false },
        _config: { state: true },
    };

    static styles = css`
        hr {
            border-color: var(--divider-color);
            border-bottom: none;
            margin: var(--ha-space-4) 0;

            &:last-child {
                display: none;
            }
        }
    `;

    render() {
        if (!this.hass || !this._config) {
            return nothing;
        }

        return html`
            <ha-card>
                ${this._config.title
                ? html`
                    <h1 class="card-header">
                        <div class="name">${this._config.title}</div>
                    </h1>
                ` : ''}
                <div class="card-content">
                ${this._config.entity.map(entityId => html`
                    <automation-glance-item
                        .hass=${this.hass}
                        .config=${this._config}
                        .entityId=${entityId}
                    ></automation-glance-item>
                    <hr />
                `)}
                </div>
            </ha-card>
        `;
    }

    setConfig(config) {
        if (!config.entity?.length) {
            throw new Error(localize(null, 'errors.missingEntity'));
        }
        if (config.entity.some(id => !id.startsWith('automation.'))) {
            throw new Error(localize(null, 'errors.invalidEntity'));
        }
        this._config = config;
    }

    static getConfigForm() {
        return {
            schema: [
                { name: 'title', selector: { text: {} } },
                {
                    name: 'entity',
                    required: true,
                    selector: {
                        entity: {
                            multiple: true,
                            reorder: true,
                            filter: { domain: 'automation' },
                        }
                    }
                },
                {
                    type: 'expandable',
                    name: '',
                    title: localize(null, 'config.labels.displayOptions'),
                    flatten: true,
                    schema: [
                        {
                            type: 'grid',
                            name: '',
                            flatten: true,
                            schema: [
                                { name: 'showToggle', selector: { boolean: {} } },
                                { name: 'showDescription', selector: { boolean: {} } },
                                { name: 'showConditions', selector: { boolean: {} } },
                                { name: 'showId', selector: { boolean: {} } },
                                { name: 'showTooltip', selector: { boolean: {} } },
                            ]
                        }
                    ]
                },
            ],
            computeLabel: (schema) => {
                if ([
                    'showToggle',
                    'showDescription',
                    'showConditions',
                    'showId',
                    'showTooltip',
                ].includes(schema.name)) {
                    return localize(null, 'config.labels.' + schema.name);
                }
            },
            computeHelper: (schema) => {

            },
        };
    }

    static getStubConfig() {
        return {
            showToggle: true,
            showDescription: true,
            showConditions: true,
            showId: true,
            showTooltip: true,
        };
    }
}
customElements.define('automation-glance', AutomationGlanceCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: 'automation-glance',
    name: 'Automation Glance',
    preview: false,
    description: localize(null, 'config.description'),
    documentationURL: 'https://github.com/mistic100/hass-automation-glance',
});

console.info('%c AUTOMATION-GLANCE %c v' + version + ' ',
    'color: orange; font-weight: bold; background: black',
    'color: white; font-weight: bold; background: dimgray'
);
