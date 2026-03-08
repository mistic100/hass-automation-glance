import { HomeAssistant } from 'custom-card-helpers';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { localize } from '../localize';
import { AutomationGlanceConfig } from '../types';

@customElement('automation-glance')
export class AutomationGlanceCard extends LitElement {

    @property({ attribute: false }) public hass: HomeAssistant;

    @state() private config: AutomationGlanceConfig;

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
        if (!this.hass || !this.config) {
            return nothing;
        }

        return html`
            <ha-card>
                ${this.config.title
                ? html`
                    <h1 class="card-header">
                        <div class="name">${this.config.title}</div>
                    </h1>
                ` : ''}
                <div class="card-content">
                ${this.config.entity.map(entityId => html`
                    <automation-glance-item
                        .hass=${this.hass}
                        .config=${this.config}
                        .entityId=${entityId}
                    ></automation-glance-item>
                    <hr />
                `)}
                </div>
            </ha-card>
        `;
    }

    setConfig(config: AutomationGlanceConfig) {
        if (!config.entity?.length) {
            throw new Error(localize(null, 'errors.missingEntity'));
        }
        if (config.entity.some(id => !id.startsWith('automation.'))) {
            throw new Error(localize(null, 'errors.invalidEntity'));
        }

        this.config = {
            showToggle: true,
            showDescription: true,
            showConditions: true,
            showId: true,
            showTooltip: true,
            ...config,
        };
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
                                { name: 'showToggle', selector: { boolean: {} }, default: true },
                                { name: 'showDescription', selector: { boolean: {} }, default: true },
                                { name: 'showConditions', selector: { boolean: {} }, default: true },
                                { name: 'showId', selector: { boolean: {} }, default: true },
                                { name: 'showTooltip', selector: { boolean: {} }, default: true },
                            ]
                        }
                    ]
                },
            ],
            computeLabel: (schema: { name: string }) => {
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
        };
    }
}
