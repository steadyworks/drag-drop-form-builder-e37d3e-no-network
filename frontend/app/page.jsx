'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'

// ============================================================
// Constants
// ============================================================

const PALETTE_ITEMS = [
  { type: 'text',     label: 'Text Input',       testId: 'palette-text' },
  { type: 'number',  label: 'Number Input',     testId: 'palette-number' },
  { type: 'email',   label: 'Email Input',      testId: 'palette-email' },
  { type: 'dropdown', label: 'Dropdown Select', testId: 'palette-dropdown' },
  { type: 'checkbox', label: 'Checkbox',        testId: 'palette-checkbox' },
  { type: 'date',    label: 'Date Picker',      testId: 'palette-date' },
]

const FIELD_DEFAULTS = {
  text:     'Text Input',
  number:   'Number Input',
  email:    'Email Input',
  dropdown: 'Dropdown Select',
  checkbox: 'Checkbox',
  date:     'Date Picker',
}

// ============================================================
// Helpers
// ============================================================

function createField(type, id) {
  return {
    id,
    type,
    label: FIELD_DEFAULTS[type],
    required: false,
    placeholder: '',
    options: '',
    validation: {},
  }
}

// ============================================================
// FieldCard
// ============================================================

function FieldCard({ field, isSelected, onSelect, onDelete, onDragStart, onDragOver, onDrop }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) {
      gsap.from(ref.current, { opacity: 0, y: -8, duration: 0.25, ease: 'power2.out' })
    }
  }, [])

  return (
    <div
      ref={ref}
      className={`field-card${isSelected ? ' field-card--selected' : ''}`}
      data-testid={`field-${field.id}`}
      draggable
      onClick={() => onSelect(field.id)}
      onDragStart={(e) => onDragStart(e, field.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, field.id)}
    >
      <div className="field-card-header">
        <span className="field-type-badge">{field.type}</span>
        <span className="field-card-label">{field.label || `(${FIELD_DEFAULTS[field.type]})`}</span>
        {isSelected && (
          <button
            data-testid="delete-field-btn"
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(field.id)
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================
// ConfigPanel
// ============================================================

function ConfigPanel({ field, onUpdate, onUpdateValidation }) {
  const showPlaceholder = ['text', 'number', 'email'].includes(field.type)
  const showOptions = field.type === 'dropdown'
  const hasValidation = ['text', 'number', 'date'].includes(field.type)

  return (
    <div className="config-panel" data-testid="config-panel">
      <h3>Configure Field</h3>

      {/* Label */}
      <div className="config-group">
        <label className="config-label-text">Label</label>
        <input
          type="text"
          data-testid="config-label"
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
        />
      </div>

      {/* Required */}
      <div className="config-group">
        <label className="config-checkbox-label">
          <input
            type="checkbox"
            data-testid="config-required"
            checked={field.required}
            onChange={(e) => onUpdate({ required: e.target.checked })}
          />
          Required
        </label>
      </div>

      {/* Placeholder */}
      {showPlaceholder && (
        <div className="config-group">
          <label className="config-label-text">Placeholder</label>
          <input
            type="text"
            data-testid="config-placeholder"
            value={field.placeholder}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
          />
        </div>
      )}

      {/* Options (dropdown only) */}
      {showOptions && (
        <div className="config-group">
          <label className="config-label-text">Options (comma-separated)</label>
          <input
            type="text"
            data-testid="config-options"
            value={field.options}
            onChange={(e) => onUpdate({ options: e.target.value })}
          />
        </div>
      )}

      {/* Validation Rules */}
      {hasValidation && (
        <div className="config-group" data-testid="config-validation">
          <span className="config-section-title">Validation Rules</span>

          {field.type === 'text' && (
            <>
              <div className="validation-row">
                <label>Min Length</label>
                <input
                  type="number"
                  min="0"
                  value={field.validation.minLength ?? ''}
                  onChange={(e) => onUpdateValidation('minLength', e.target.value)}
                />
              </div>
              <div className="validation-row">
                <label>Max Length</label>
                <input
                  type="number"
                  min="0"
                  value={field.validation.maxLength ?? ''}
                  onChange={(e) => onUpdateValidation('maxLength', e.target.value)}
                />
              </div>
            </>
          )}

          {field.type === 'number' && (
            <>
              <div className="validation-row">
                <label>Min Value</label>
                <input
                  type="number"
                  value={field.validation.min ?? ''}
                  onChange={(e) => onUpdateValidation('min', e.target.value)}
                />
              </div>
              <div className="validation-row">
                <label>Max Value</label>
                <input
                  type="number"
                  value={field.validation.max ?? ''}
                  onChange={(e) => onUpdateValidation('max', e.target.value)}
                />
              </div>
            </>
          )}

          {field.type === 'date' && (
            <>
              <div className="validation-row">
                <label>Min Date</label>
                <input
                  type="date"
                  value={field.validation.minDate ?? ''}
                  onChange={(e) => onUpdateValidation('minDate', e.target.value)}
                />
              </div>
              <div className="validation-row">
                <label>Max Date</label>
                <input
                  type="date"
                  value={field.validation.maxDate ?? ''}
                  onChange={(e) => onUpdateValidation('maxDate', e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// PreviewForm
// ============================================================

function PreviewForm({ fields }) {
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [submitSuccess, setSubmitSuccess] = useState(null)

  // Reset state whenever fields change (e.g. switching to Preview mode)
  useEffect(() => {
    const init = {}
    fields.forEach((f) => {
      init[f.id] = f.type === 'checkbox' ? false : ''
    })
    setValues(init)
    setErrors({})
    setSubmitSuccess(null)
  }, [fields])

  const setValue = (id, val) => setValues((prev) => ({ ...prev, [id]: val }))

  const handleSubmit = () => {
    const newErrors = {}
    let hasError = false

    fields.forEach((f) => {
      const val = values[f.id] !== undefined ? values[f.id] : (f.type === 'checkbox' ? false : '')
      if (errs.length > 0) {
        newErrors[f.id] = errs
        hasError = true
      }
    })

    setErrors(newErrors)

    if (!hasError) {
      const parts = fields.map((f) => {
        const val = values[f.id]
        const display = f.type === 'checkbox' ? (val ? 'Yes' : 'No') : (val ?? '')
        return `${f.label}: ${display}`
      })
      setSubmitSuccess(parts.join(' | '))
    } else {
      setSubmitSuccess(null)
    }
  }

  const renderControl = (field) => {
    const value = values[field.id] !== undefined
      ? values[field.id]
      : (field.type === 'checkbox' ? false : '')

    if (field.type === 'text' || field.type === 'number' || field.type === 'email') {
      return (
        <input
          type={field.type}
          data-testid={`preview-${field.id}`}
          value={value}
          placeholder={field.placeholder || ''}
          onChange={(e) => setValue(field.id, e.target.value)}
        />
      )
    }

    if (field.type === 'checkbox') {
      return (
        <div className="preview-checkbox-wrapper">
          <input
            type="checkbox"
            data-testid={`preview-${field.id}`}
            checked={value}
            onChange={(e) => setValue(field.id, e.target.checked)}
          />
        </div>
      )
    }

    if (field.type === 'dropdown') {
      const opts = field.options
        ? field.options.split(',').map((o) => o.trim()).filter(Boolean)
        : []
      return (
        <select
          data-testid={`preview-${field.id}`}
          value={value}
          onChange={(e) => setValue(field.id, e.target.value)}
        >
          <option value="">Select an option</option>
          {opts.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )
    }

    if (field.type === 'date') {
      return (
        <input
          type="date"
          data-testid={`preview-${field.id}`}
          value={value}
          onChange={(e) => setValue(field.id, e.target.value)}
        />
      )
    }

    return null
  }

  return (
    <div className="preview-form">
      {fields.length === 0 && (
        <p className="preview-empty">No fields yet. Switch to Build mode to add fields.</p>
      )}

      {fields.map((field) => (
        <div key={field.id} className="preview-field">
          <label className="preview-label">
            {field.label}{field.required ? ' *' : ''}
          </label>
          {renderControl(field)}
          {errors[field.id]?.length > 0 && (
            <span data-testid={`error-${field.id}`} className="error-msg">
              {errors[field.id][0]}
            </span>
          )}
        </div>
      ))}

      <button data-testid="submit-btn" className="submit-btn" onClick={handleSubmit}>
        Submit
      </button>

      {submitSuccess && (
        <div data-testid="submit-success" className="success-msg">
          <strong>Form submitted successfully!</strong>
          <p>{submitSuccess}</p>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Main Page
// ============================================================

export default function FormBuilderPage() {
  const [fields, setFields] = useState([])
  const [nextId, setNextId] = useState(1)
  const [selectedId, setSelectedId] = useState(null)
  const [mode, setMode] = useState('build')
  const [showExport, setShowExport] = useState(false)
  const [exportedJson, setExportedJson] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [importJson, setImportJson] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [dragOverCanvas, setDragOverCanvas] = useState(false)

  // Load from localStorage (client-side only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('formBuilderState')
      if (saved) {
        const data = JSON.parse(saved)
        if (Array.isArray(data.fields)) setFields(data.fields)
        if (typeof data.nextId === 'number') setNextId(data.nextId)
      }
    } catch {
      // ignore parse errors
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage after initial load
  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem('formBuilderState', JSON.stringify({ fields, nextId }))
  }, [fields, nextId, isLoaded])

  const selectedField = fields.find((f) => f.id === selectedId) ?? null

  // ---- Field operations ----

  const addField = (type) => {
    const id = nextId
    setFields((prev) => [...prev, createField(type, id)])
    setNextId((prev) => prev + 1)
  }

  const updateField = (id, updates) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  const updateValidation = (id, key, value) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, validation: { ...f.validation, [key]: value } } : f
      )
    )
  }

  const deleteField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const clearAll = () => {
    setFields([])
    setNextId(1)
    setSelectedId(null)
  }

  // ---- Export / Import ----

  const handleExport = () => {
    const schema = fields.map((f) => ({
      id: f.id,
      type: f.type,
      label: f.label,
      required: f.required,
      placeholder: f.placeholder,
      options: f.options,
      validation: f.validation,
    }))
    setExportedJson(JSON.stringify(schema, null))
  }

  const handleImport = () => {
    setImportJson('')
  }

  const confirmImport = () => {
    try {
      const parsed = JSON.parse(importJson)
      if (!Array.isArray(parsed)) return

      const imported = parsed.map((f, idx) => ({
        id: f.id != null ? Number(f.id) : idx + 1,
        type: f.type || 'text',
        label: f.label || '',
        required: !!f.required,
        placeholder: f.placeholder || '',
        options: f.options || '',
        validation: f.validation || {},
      }))

      const maxId = imported.reduce((m, f) => Math.max(m, f.id), 0)
      setFields(imported)
      setNextId(maxId + 1)
      setSelectedId(null)
      setImportJson('')
    } catch {
      // Invalid JSON — silently ignore
    }
  }

  // ---- Drag and Drop handlers ----

  const handlePaletteDragStart = (e, type) => {
    e.dataTransfer.setData('fieldType', type)
  }

  const handleCanvasDragOver = (e) => {
    e.preventDefault()
    setDragOverCanvas(true)
  }

  const handleCanvasDragLeave = () => {
    setDragOverCanvas(false)
  }

  const handleCanvasDrop = (e) => {
    e.preventDefault()
    setDragOverCanvas(false)
    const fieldType = e.dataTransfer.getData('fieldType')
    if (fieldType) {
      addField(fieldType)
    }
  }

  const handleFieldDragStart = (e, fieldId) => {
    e.stopPropagation()
    e.dataTransfer.setData('fieldId', String(fieldId))
  }

  const handleFieldDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleFieldDrop = (e, targetId) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverCanvas(false)

    const fieldId = e.dataTransfer.getData('fieldId')
    const fieldType = e.dataTransfer.getData('fieldType')

    if (fieldId) {
      // Reorder: dragged field onto another field
      const sourceId = parseInt(fieldId, 10)
      if (sourceId === targetId) return

      const box = e.currentTarget.getBoundingClientRect()
      const midY = box.top + box.height / 2
      const insertBefore = e.clientY < midY

      setFields((prev) => {
        const filtered = prev.filter((f) => f.id !== sourceId)
        const targetIdx = filtered.findIndex((f) => f.id === targetId)
        if (targetIdx < 0) return prev
        const insertIdx = insertBefore ? targetIdx : targetIdx + 1
        const dragged = prev.find((f) => f.id === sourceId)
        if (!dragged) return prev
        const result = [...filtered]
        result.splice(insertIdx, 0, dragged)
        return result
      })
    } else if (fieldType) {
      // Palette item dropped on an existing field — insert before that field
      const id = nextId
      const newField = createField(fieldType, id)
      setFields((prev) => {
        const targetIdx = prev.findIndex((f) => f.id === targetId)
        const result = [...prev]
        result.splice(targetIdx < 0 ? result.length : targetIdx, 0, newField)
        return result
      })
      setNextId((prev) => prev + 1)
    }
  }

  // ---- Render ----

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">Form Builder</h1>

        <nav className="mode-tabs">
          <button
            data-testid="mode-build"
            className={`tab-btn${mode === 'build' ? ' tab-btn--active' : ''}`}
            onClick={() => setMode('build')}
          >
            Build
          </button>
          <button
            data-testid="mode-preview"
            className={`tab-btn${mode === 'preview' ? ' tab-btn--active' : ''}`}
            onClick={() => setMode('preview')}
          >
            Preview
          </button>
        </nav>

        <div className="toolbar">
          <button data-testid="export-btn" className="toolbar-btn" onClick={handleExport}>
            Export
          </button>
          <button data-testid="import-btn" className="toolbar-btn" onClick={handleImport}>
            Import
          </button>
          <button
            data-testid="clear-all-btn"
            className="toolbar-btn toolbar-btn--danger"
            onClick={clearAll}
          >
            Clear Form
          </button>
        </div>
      </header>

      {/* Build Mode */}
      {mode === 'build' && (
        <div className="build-container">
          <div className="build-layout">
            {/* Palette */}
            <aside data-testid="palette" className="palette">
              <p className="palette-title">Field Types</p>
              {PALETTE_ITEMS.map((item) => (
                <div
                  key={item.type}
                  data-testid={item.testId}
                  className="palette-item"
                  draggable
                  onDragStart={(e) => handlePaletteDragStart(e, item.type)}
                >
                  {item.label}
                </div>
              ))}
            </aside>

            {/* Canvas */}
            <main
              data-testid="form-canvas"
              className={`form-canvas${dragOverCanvas ? ' form-canvas--drag-over' : ''}`}
              onDragOver={handleCanvasDragOver}
              onDragLeave={handleCanvasDragLeave}
              onDrop={handleCanvasDrop}
              onClick={(e) => {
                if (e.target === e.currentTarget) setSelectedId(null)
              }}
            >
              {fields.length === 0 && (
                <p className="canvas-empty">Drag fields from the palette to build your form</p>
              )}
              {fields.map((field) => (
                <FieldCard
                  key={field.id}
                  field={field}
                  isSelected={selectedId === field.id}
                  onSelect={setSelectedId}
                  onDelete={deleteField}
                  onDragStart={handleFieldDragStart}
                  onDragOver={handleFieldDragOver}
                  onDrop={handleFieldDrop}
                />
              ))}
            </main>

            {/* Config Panel (shown when a field is selected) */}
            {selectedField && (
              <ConfigPanel
                field={selectedField}
                onUpdate={(updates) => updateField(selectedField.id, updates)}
                onUpdateValidation={(key, val) => updateValidation(selectedField.id, key, val)}
              />
            )}
          </div>

          {/* Export area */}
          {showExport && (
            <div className="export-area">
              <h3>Exported Schema</h3>
              <textarea
                data-testid="schema-output"
                value={exportedJson}
                readOnly
                rows={12}
              />
              <button className="export-close-btn" onClick={() => setShowExport(false)}>
                Close
              </button>
            </div>
          )}

          {/* Import area */}
          {showImport && (
            <div className="import-area">
              <h3>Import Schema</h3>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="Paste JSON schema here…"
                rows={12}
              />
              <div className="import-actions">
                <button className="import-confirm-btn" onClick={confirmImport}>
                  Confirm
                </button>
                <button className="import-cancel-btn" onClick={() => setShowImport(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Mode */}
      {mode === 'preview' && (
        <div className="preview-container">
          <PreviewForm fields={fields} />
        </div>
      )}
    </div>
  )
}
