import { localize } from '../localize';
import { RenderFn } from '../types';
import { renderCalendar } from './calendar';
import { renderConversation } from './conversation';
import { renderDevice } from './device';
import { renderEvent } from './event';
import { renderNumericState } from './numericState';
import { renderState } from './state';
import { renderSun } from './sun';
import { renderTag } from './tag';
import { renderTemplate } from './template';
import { renderTime } from './time';
import { renderTimePattern } from './timePattern';
import { renderTrigger } from './trigger';
import { renderZone } from './zone';

export const RENDERERS: Record<string, RenderFn> = {
    _: (hass, trigger) => localize(hass, 'errors.unsupportedDomain', { domain: trigger.trigger ?? trigger.condition }),
    calendar: renderCalendar,
    conversation: renderConversation,
    device: renderDevice,
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
