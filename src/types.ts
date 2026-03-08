import { HomeAssistant } from 'custom-card-helpers';
import { html } from 'lit';

export type AutomationGlanceConfig = {
    entity: string[];
    title?: string;
    showToggle?: boolean;
    showDescription?: boolean;
    showConditions?: boolean;
    showId?: boolean;
    showTooltip?: boolean;
};

export type AutomationTrigger = {
    trigger: string;
    enabled?: boolean;
    alias?: string;
    [K: string]: any;
};

export type AutomationCondition = {
    condition: string;
    enabled?: boolean;
    alias?: string;
    conditions?: AutomationCondition[];
    [K: string]: any;
};

export type AutomationConfig = {
    id: string;
    description: string;
    triggers: AutomationTrigger[];
    conditions: AutomationCondition[];
};

export type RenderFn = (hass: HomeAssistant, trigger: AutomationTrigger | AutomationCondition) => string | ReturnType<typeof html>;
