# Automation glance

Home Assistant card to display details about automations.

![](./screenshots/card.png)

## Features

- Automation icon and name
- Toggle for automation activation
- Automation description
- List of triggers and conditions

The following domains are supported:

- calendar
- conversation
- numeric_state
- state
- sun
- template
- time_pattern
- time
- trigger
- webhook
- zone

For other domains, please open an issue.

Only English is supported for now.

---

## Usage

```yaml
type: custom:automation-glance
title: 'Chauffages'
entity:
  - automation.chauffage_sbd_on
  - automation.chauffage_sdb_off
  - automation.clim_chambre_on
  - automation.clim_chambre_off
showDescription: false
showTooltip: true
showToggle: true
showConditions: true
showId: true
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
