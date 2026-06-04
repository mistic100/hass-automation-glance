import { version } from '../package.json';
import './components/badges';
import './components/card';
import './components/item';
import { localize } from './localize';

window.customCards = window.customCards || [];
window.customCards.push({
    type: 'automation-glance',
    name: 'Automation Glance',
    preview: false,
    description: localize(null, 'config.description'),
    documentationURL: 'https://github.com/mistic100/hass-automation-glance',
    getEntitySuggestion: (hass, entityId) => {
        if (entityId.split('.')[0] !== 'automation') {
            return null;
        }
        return {
            config: {
                type: 'custom:automation-glance',
                entity: [entityId],
            },
        };
    },
});

console.info('%c AUTOMATION-GLANCE %c v' + version + ' ',
    'color: orange; font-weight: bold; background: black',
    'color: white; font-weight: bold; background: dimgray'
);
