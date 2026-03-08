import { HomeAssistant } from 'custom-card-helpers';
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { localize } from '../localize';
import { AutomationConfig, AutomationGlanceConfig } from '../types';

@customElement('automation-glance-item')
export class AutomationGlanceItem extends LitElement {

    @property({ attribute: false }) public hass: HomeAssistant;
    @property({ attribute: false }) public config: AutomationGlanceConfig;
    @property({ type: String }) public entityId: string;
    
    @state() private automation: AutomationConfig;
    @state() private error: string ;

    #currentId: string = null;

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

            ${this.error
                ? html`
                <ha-alert alert-type="error">
                    ${this.error}
                </ha-alert>
            ` : ''}

            ${this.automation
                ? html`
                ${this.automation.description && this.config.showDescription
                        ? html`
                    <div class="description">
                        <ha-markdown .content=${this.automation.description}></ha-markdown>
                    </div>
                ` : ''}

                <automation-glance-triggers
                    .hass=${this.hass}
                    .config=${this.config}
                    .automation=${this.automation}
                ></automation-glance-triggers>

                ${this.automation.conditions?.length && this.config.showConditions
                        ? html`
                    <automation-glance-conditions
                        .hass=${this.hass}
                        .config=${this.config}
                        .automation=${this.automation}
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
            const result = await this.hass.callWS<any>({
                type: 'automation/config',
                entity_id: this.entityId
            });

            this.automation = result.config;
            this.error = null;
            this.#currentId = this.entityId;

        } catch (err) {
            console.error(err);
            this.error = localize(this.hass, 'errors.fetchError');
            this.automation = null;
            this.#currentId = null;
        }
    }
}
