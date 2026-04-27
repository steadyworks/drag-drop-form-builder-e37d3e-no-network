# Drag-and-Drop Form Builder

Build a browser-based visual form builder where anyone can assemble a form by dragging field types onto a canvas, configure each field's properties, preview and validate the form, and export/import the schema as JSON — all without a backend, with state living entirely in localStorage.

## Stack

- **Frontend**: React, port **3000**
- **Animations**: GSAP (where applicable)
- **Persistence**: localStorage only — no backend, no database

## App Structure

The app is a **single page at `/`**. There are no other routes.

Two top-level tabs switch between **Build** mode and **Preview** mode. The active mode tab is visually distinguished.

## Build Mode

### Field Palette

A sidebar listing the draggable field types available to add to the form. Each item is drag-initiable using the HTML5 Drag and Drop API (or equivalent).

Available field types:

- **Text Input** — single-line text
- **Number Input** — numeric entry
- **Email Input** — email address entry
- **Dropdown Select** — select from a list of options
- **Checkbox** — boolean toggle
- **Date Picker** — date selection

### Form Canvas

The central workspace. Dragging a field type from the palette and dropping it onto the canvas appends a new field of that type. Fields stack vertically in the order they were added.

Each field on the canvas is a card showing its label (defaulting to the field type name if no label has been set yet). Clicking a field card selects it and opens the **Config Panel**.

**Reordering**: Fields already on the canvas can be dragged and dropped within the canvas to change their order. While dragging over the canvas, a visual gap or insertion line shows where the field will land.

**Deletion**: When a field is selected, pressing the Delete key or clicking the delete button on the field card removes it from the canvas.

### Config Panel

Appears when a field is selected. Contains controls for:

- **Label** — text input; the field's visible label in Preview. Required.
- **Required** — checkbox; marks the field as mandatory during submission.
- **Placeholder** — text input; hint text shown inside the field (applies to text, number, and email field types).
- **Options** — text input; visible only for Dropdown fields. Enter a comma-separated list of option values (e.g. `Red,Green,Blue`).
- **Validation rules** — depends on field type:
  - Text: minimum character length, maximum character length
  - Number: minimum value, maximum value
  - Email: no extra configuration (format validation is always applied)
  - Date: minimum date, maximum date
  - Checkbox and Dropdown: no extra validation rules beyond Required

Config changes apply immediately to the field's stored definition.

### Export / Import

- **Export**: clicking the Export button serializes the current form definition — field order, types, labels, placeholders, options, required flag, and validation rules — as a formatted JSON string and displays it in a read-only textarea on the page.
- **Import**: a separate button opens/activates the import workflow. Pasting a valid JSON schema previously exported from this app and confirming replaces the current canvas with the fields described in the JSON. Invalid JSON should be gracefully ignored.

### Clear Form

A button that wipes all fields from the canvas and resets the builder to an empty state.

## Preview Mode

Renders the form as an end user would experience it. All field cards are replaced by actual form controls rendered with their configured labels, placeholders, and options.

Field types render as:

- Text Input → `<input type="text">`
- Number Input → `<input type="number">`
- Email Input → `<input type="email">`
- Dropdown Select → `<select>` with the configured options as `<option>` elements
- Checkbox → `<input type="checkbox">` with its label
- Date Picker → `<input type="date">`

A **Submit** button sits at the bottom of the form. On click, validation runs against all fields:

- **Required** — the field must not be empty (for checkbox: must be checked)
- **Text min/max length** — character count must fall within the configured bounds
- **Number min/max** — numeric value must fall within the configured bounds
- **Email format** — value must contain `@` followed by a domain segment
- **Date min/max** — selected date must fall within the configured bounds

If any field fails validation, an error message appears directly below that field. All errors across all fields are shown simultaneously; the form does not stop at the first failure.

If all validations pass, the form clears its error state and a success message appears showing the submitted data as a human-readable summary of label–value pairs.

## Persistence

Every time the form definition changes (field added, removed, reordered, or configured), the full form state is written to localStorage. On page load, if a saved state exists it is read from localStorage and the canvas is restored — including field order, labels, types, placeholders, options, required flags, and validation rules.

## `data-testid` Reference

Every interactive and observable element must carry the exact `data-testid` attribute listed below.

### Mode Tabs

- `mode-build` — the Build mode tab button
- `mode-preview` — the Preview mode tab button

### Field Palette

- `palette` — the palette sidebar container
- `palette-text` — Text Input draggable item
- `palette-number` — Number Input draggable item
- `palette-email` — Email Input draggable item
- `palette-dropdown` — Dropdown Select draggable item
- `palette-checkbox` — Checkbox draggable item
- `palette-date` — Date Picker draggable item

### Form Canvas

- `form-canvas` — the canvas drop zone container
- `field-{id}` — each placed field card, where `{id}` is an auto-incrementing integer starting at 1. The first field dropped is `field-1`, the second is `field-2`, and so on. IDs are assigned at creation time and do not change when fields are reordered or others are deleted.

### Field Actions

- `delete-field-btn` — the delete button on a selected field card (or always visible on the card)

### Config Panel

- `config-panel` — the configuration panel container
- `config-label` — the label text input inside the config panel
- `config-required` — the required checkbox inside the config panel
- `config-placeholder` — the placeholder text input inside the config panel
- `config-options` — the options text input (Dropdown only) inside the config panel
- `config-validation` — the container wrapping all validation rule inputs inside the config panel

### Export / Import

- `export-btn` — the Export Schema button
- `schema-output` — the textarea where the exported JSON is displayed
- `import-btn` — the Import Schema button

### Clear Form

- `clear-all-btn` — the Clear Form button

### Preview Mode

- `preview-{id}` — the form control for each field in Preview mode, using the same `{id}` as its Build-mode counterpart
- `submit-btn` — the Submit button
- `error-{id}` — the validation error message element for field `{id}` (only present/visible when that field has a validation error)
- `submit-success` — the success message shown after a valid form submission
