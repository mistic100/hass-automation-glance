import { RenderFn } from '../types';

export const renderTimePattern: RenderFn = (hass, trigger) => {
    return `${trigger.hours ?? '*'} ${trigger.minutes ?? '*'} ${trigger.seconds ?? '*'}`;
}
