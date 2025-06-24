// src/components/NoteForm.jsx
import React, { useState } from 'react';
import './NoteForm.css';

function NoteForm({ onSaveNote, userTags = [] }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [noteType, setNoteType] = useState('text');
  const [listItemsInput, setListItemsInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const rawTags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    const uniqueTags = [...new Set(rawTags)];

    let noteData = {
      title,
      tags: uniqueTags,
      type: noteType,
      isUnread: true,
      lastViewedAt: null,
      isFixed: false,
      isArchived: false,
      isDeleted: false,
    };

    if (noteType === 'text') {
      noteData.content = content;
    } else if (noteType === 'list') {
      noteData.listItems = listItemsInput.split('\n')
                                        .map(itemText => itemText.trim())
                                        .filter(itemText => itemText !== '')
                                        .map(itemText => ({ text: itemText, completed: false }));
    }

    onSaveNote(noteData);
    handleClear();
  };

  const handleClear = () => {
    setTitle('');
    setContent('');
    setTagsInput('');
    setListItemsInput('');
    setNoteType('text');
    setShowTagSuggestions(false);
  };

  const handleTagInputChange = (e) => {
    setTagsInput(e.target.value);
    setShowTagSuggestions(e.target.value.length > 0);
  };

  const filteredTagSuggestions = userTags.filter(tag => {
    const currentTyping = tagsInput.split(',').pop().trim().toLowerCase();
    const existingTags = tagsInput.split(',').map(t => t.trim().toLowerCase());
    return currentTyping !== '' && 
           tag.name.toLowerCase().includes(currentTyping) &&
           !existingTags.includes(tag.name.toLowerCase());
  });

  const handleAddTagFromSuggestion = (tagName) => {
    const currentTags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');
    currentTags.pop(); // Remove the current typing
    setTagsInput([...currentTags, tagName].join(', ') + ', ');
    setShowTagSuggestions(false);
  };

  const removeTag = (tagToRemove) => {
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== tagToRemove);
    setTagsInput(tags.join(', '));
  };

  const displayTags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');

  return (
    <div className="note-form-container">
      <div className="note-form-header">
        <h2 className="note-form-title">Crear Nueva Nota</h2>
        <p className="note-form-subtitle">Organiza tus ideas y pensamientos</p>
      </div>

      <form onSubmit={handleSubmit} className="note-form">
        {/* Tipo de Nota */}
        <div className="form-group">
          <label className="form-label">Tipo de Nota</label>
          <div className="note-type-buttons">
            <button
              type="button"
              onClick={() => setNoteType('text')}
              className={`note-type-btn ${noteType === 'text' ? 'active text-type' : ''}`}
            >
              <span className="note-type-icon">📝</span>
              Nota de Texto
            </button>
            <button
              type="button"
              onClick={() => setNoteType('list')}
              className={`note-type-btn ${noteType === 'list' ? 'active list-type' : ''}`}
            >
              <span className="note-type-icon">📋</span>
              Nota de Lista
            </button>
          </div>
        </div>

        {/* Título */}
        <div className="form-group">
          <label className="form-label">Título</label>
          <input
            type="text"
            placeholder="Título de la nota (opcional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Contenido */}
        <div className="form-group">
          <label className="form-label">
            {noteType === 'text' ? 'Contenido' : 'Elementos de la Lista'}
          </label>
          {noteType === 'text' ? (
            <textarea
              placeholder="Escribe tu nota aquí..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="6"
              required
              className="form-textarea"
            />
          ) : (
            <textarea
              placeholder="Escribe los elementos de la lista, uno por línea..."
              value={listItemsInput}
              onChange={(e) => setListItemsInput(e.target.value)}
              rows="6"
              required
              className="form-textarea list-textarea"
            />
          )}
        </div>

        {/* Etiquetas */}
        <div className="form-group">
          <label className="form-label">
            <span className="tag-icon">🏷️</span>
            Etiquetas
          </label>
          
          {/* Tags actuales */}
          {displayTags.length > 0 && (
            <div className="current-tags">
              {displayTags.map((tag, index) => (
                <span key={index} className="tag-pill">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="tag-input-container">
            <input
              type="text"
              placeholder="Agregar etiquetas (separadas por comas)"
              value={tagsInput}
              onChange={handleTagInputChange}
              onFocus={() => setShowTagSuggestions(true)}
              onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
              className="form-input tag-input"
            />
            
            {/* Sugerencias de etiquetas */}
            {showTagSuggestions && filteredTagSuggestions.length > 0 && (
              <div className="tag-suggestions">
                {filteredTagSuggestions.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleAddTagFromSuggestion(tag.name)}
                    className="tag-suggestion"
                  >
                    <span
                      className="tag-color-indicator"
                      style={{ backgroundColor: tag.color || '#6B7280' }}
                    />
                    #{tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="form-buttons">
          <button type="submit" className="btn btn-primary">
            <span className="btn-icon">💾</span>
            Guardar Nota
          </button>
          <button type="button" onClick={handleClear} className="btn btn-secondary">
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}

export default NoteForm;