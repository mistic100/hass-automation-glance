import { HomeAssistant } from 'custom-card-helpers';
import { html } from 'lit';

export type AutomationGlanceConfig = {
    entity: string[];
    title?: string;
    showToggle?: boolean;
    showDescription?: boolean;
    showConditions?: boolean;
    showConditionStatus?: boolean;
    showId?: boolean;
    showTooltip?: boolean;
};

type ThresholdValue = {
    active_choice: 'number' | 'entity';
    number?: number;
    unit_of_measurement?: string;
    entity?: string;
};

type AutomationTriggerOptions = {
    offset?: { days?: number, hours?: number, minutes?: number, seconds?: number };
    offset_type?: 'before' | 'after';
    threshold?: {
        type: string;
        value?: ThresholdValue;
        value_min?: ThresholdValue;
        value_max?: ThresholdValue;
    };
    for?: { hours?: number, minutes?: number, seconds?: number };
    zone?: string | string[];
    option?: string | string[];
};

type AutomationTriggerTarget = {
    entity_id?: string | string[];
    device_id?: string | string[];
};

export type AutomationTrigger = {
    trigger: string;
    enabled?: boolean;
    alias?: string;
    target?: AutomationTriggerTarget;
    options?: AutomationTriggerOptions;
    [K: string]: any;
};

export type AutomationCondition = {
    condition: string;
    enabled?: boolean;
    alias?: string;
    target?: AutomationTriggerTarget;
    options?: AutomationTriggerOptions;
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
