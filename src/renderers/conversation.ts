import { RenderFn } from '../types';

export const renderConversation: RenderFn = (hass, trigger) => {
    return `« ${trigger.command} »`;
}
