# LEGION RX Reporting

Hidden reporting preparation layer. It has no UI and does not generate PDF yet.

## Contract

A future `Сформировать отчёт` action should pass already-prepared official result data to:

```js
LegionRXReporting.prepare(section, resultData, options)
```

Registered sections:
- `rallycross`
- `practice`
- `rally`

The reporting layer must not calculate sport results. Each sport/practice module remains the source of truth for its own results. Reporting only accepts a snapshot and prepares a section-specific report payload. PDF renderers/templates will be added later under this module without moving sport rules into reporting.
