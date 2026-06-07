import { HomeAssistant } from 'custom-card-helpers';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AutomationCondition, AutomationGlanceConfig } from '../types';

@customElement('automation-glance-condition-status')
export class AutomationGlanceConditionStatus extends LitElement {

    @property({ attribute: false }) public hass: HomeAssistant;
    @property({ attribute: false }) public config: AutomationGlanceConfig;
    @property({ attribute: false }) public condition: AutomationCondition;

    @property({ reflect: true }) private state: 'pass' | 'fail' | 'invalid' | 'unknown' = 'unknown';

    private _conditionUnsub?: Promise<any>;

    connectedCallback(): void {
        super.connectedCallback();
        this._subscribeCondition();
    }

    disconnectedCallback(): void {
        this._resetSubscription();
        super.disconnectedCallback();
    }

    private _resetSubscription() {
        if (this._conditionUnsub) {
            this._conditionUnsub.then((unsub) => unsub());
            delete this._conditionUnsub;
        }
    }

    private _subscribeCondition() {
        this._resetSubscription();

        if (!this.condition) {
            return;
        }

        this._conditionUnsub = this.hass.connection.subscribeMessage(
            (result: {
                result?: boolean;
                error?: string | { code: string; message: string };
            }) => {
                if (result.error) {
                    this.state = typeof result.error !== 'string' && result.error.code === 'invalid_format' ? 'invalid' : 'unknown';
                } else {
                    this.state = result.result ? 'pass' : 'fail';
                }
            },
            {
                type: 'subscribe_condition',
                condition: this.condition,
            }
        );
    }

    // copied from https://github.com/home-assistant/frontend/blob/dev/src/components/automation/ha-automation-row-live-test.ts
    static styles = css`
        :host {
            position: absolute;
            top: -5px;
            inset-inline-end: -5px;
            display: inline-block;
        }
        #indicator {
            width: 10px;
            height: 10px;
            border-radius: var(--ha-border-radius-circle);
            border: var(--ha-border-width-md) solid;
            box-sizing: border-box;
            background-color: var(--card-background-color);
            box-shadow: 0 0 0 2px var(--card-background-color);
            transition: all var(--ha-animation-duration-normal) ease-in-out;
        }
        :host([state="pass"]) #indicator {
            background-color: var(--ha-color-green-60);
            border-color: var(--ha-color-green-60);
        }
        :host([state="fail"]) #indicator {
            border-color: var(--ha-color-orange-60);
        }
        :host([state="invalid"]) #indicator {
            border-color: var(--ha-color-red-60);
        }
        :host([state="unknown"]) #indicator {
            border-color: var(--ha-color-neutral-60);
        }
    `;

    render() {
        return html`
            <div
                id="indicator"
                role="status"
                tabindex="0"
            ></div>
        `;
    }

}
