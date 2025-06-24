// src/components/NoteDetail.jsx
import React, { useState, useEffect } from 'react';
import './NoteDetail.css';

function NoteDetail({ note, onClose, onUpdateNote, userTags }) {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [tagsInput, setTagsInput] = useState(note.tags ? note.tags.join(', ') : '');
  const [listItems, setListItems] = useState(note.listItems || []);
  const [noteType, setNoteType] = useState(note.type || 'text');
  const [isFixed, setIsFixed] = useState(note.isFixed || false);
  const [isUnread, setIsUnread] = useState(note.isUnread || false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setTitle(note.title || '');
    setContent(note.content || '');
    setTagsInput(note.tags ? note.tags.join(', ') : '');
    setListItems(note.listItems || []);
    setNoteType(note.type || 'text');
    setIsFixed(note.isFixed || false);
    setIsUnread(note.isUnread || false);
    setIsEditing(false);
  }, [note]);

  const handleSave = () => {
    const rawTags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    const uniqueTags = [...new Set(rawTags)];

    let updatedNoteData = {
      title,
      tags: uniqueTags,
      type: noteType,
      isFixed: isFixed,
      isUnread: isUnread,
    };

    if (noteType === 'text') {
      updatedNoteData.content = content;
      delete updatedNoteData.listItems;
    } else if (noteType === 'list') {
      updatedNoteData.listItems = listItems;
      delete updatedNoteData.content;
    }

    onUpdateNote(note.id, updatedNoteData);
    setIsEditing(false);
  };

  const handleListItemChange = (index, newText) => {
    const newListItems = [...listItems];
    newListItems[index].text = newText;
    setListItems(newListItems);
  };

  const handleToggleCompleted = (index) => {
    const newListItems = [...listItems];
    newListItems[index].completed = !newListItems[index].completed;
    setListItems(newListItems);
  };

  const handleAddListItem = () => {
    setListItems([...listItems, { text: '', completed: false }]);
  };

  const handleRemoveListItem = (indexToRemove) => {
    setListItems(listItems.filter((_, index) => index !== indexToRemove));
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("itemIndex", index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    const dragIndex = e.dataTransfer.getData("itemIndex");
    const draggedItem = listItems[dragIndex];
    const newListItems = listItems.filter((_, idx) => idx !== parseInt(dragIndex));
    newListItems.splice(dropIndex, 0, draggedItem);
    setListItems(newListItems);
  };

  const handleTagInputChange = (e) => {
    setTagsInput(e.target.value);
  };

  const filteredTagSuggestions = userTags?.filter(tag =>
    tag.name.toLowerCase().includes(tagsInput.split(',').pop().trim().toLowerCase()) &&
    !tagsInput.split(',').map(t => t.trim().toLowerCase()).includes(tag.name.toLowerCase())
  ) || [];

  const handleAddTagFromSuggestion = (tagName) => {
    const currentTags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');
    if (!currentTags.includes(tagName)) {
      setTagsInput([...currentTags, tagName].join(', ') + ', ');
    } else {
      setTagsInput(currentTags.join(', '));
    }
  };

  return (
    <div className="note-detail-overlay">
      <div className="note-detail-modal">
        {/* Header mejorado */}
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              {isEditing ? '✏️' : (noteType === 'list' ? '📋' : '📝')}
            </div>
            <div className="header-text">
              <h2>
                {isEditing ? 'Editar Nota' : (note.title || 'Detalle de la Nota')}
              </h2>
              <span className="note-type-badge">
                {noteType === 'list' ? 'Lista de tareas' : 'Nota de texto'}
              </span>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <span>×</span>
          </button>
        </div>

        <div className="modal-body">
          {isEditing ? (
            <>
              {/* MODO EDICIÓN MEJORADO */}
              <div className="edit-container">
                {/* Tipo de nota selector */}
                <div className="note-type-selector">
                  <button 
                    className={`type-button ${noteType === 'text' ? 'active' : ''}`}
                    onClick={() => setNoteType('text')}
                  >
                    <span className="type-icon">📄</span>
                    Texto
                  </button>
                  <button 
                    className={`type-button ${noteType === 'list' ? 'active' : ''}`}
                    onClick={() => setNoteType('list')}
                  >
                    <span className="type-icon">📋</span>
                    Lista
                  </button>
                </div>

                {/* Campo título */}
                <div className="input-group">
                  <label className="input-label">
                    <span className="label-icon">✨</span>
                    Título
                  </label>
                  <input
                    type="text"
                    className="detail-input-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Dale un título genial a tu nota..."
                  />
                </div>

                {/* Contenido según tipo */}
                {noteType === 'text' && (
                  <div className="input-group">
                    <label className="input-label">
                      <span className="label-icon">💭</span>
                      Contenido
                    </label>
                    <textarea
                      className="detail-textarea-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows="12"
                      placeholder="Escribe aquí tus ideas, pensamientos o cualquier cosa que quieras recordar..."
                    />
                  </div>
                )}

                {noteType === 'list' && (
                  <div className="input-group">
                    <label className="input-label">
                      <span className="label-icon">📋</span>
                      Tareas
                    </label>
                    <div className="list-items-container">
                      {listItems.length === 0 ? (
                        <div className="empty-list-state">
                          <div className="empty-icon">📝</div>
                          <p>Tu lista está vacía</p>
                          <span>Añade tu primera tarea</span>
                        </div>
                      ) : (
                        listItems.map((item, index) => (
                          <div
                            key={index}
                            className={`list-item ${item.completed ? 'completed' : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                          >
                            <div className="list-item-drag">
                              <span className="drag-handle">⋮⋮</span>
                            </div>
                            <div className="checkbox-container">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={() => handleToggleCompleted(index)}
                                className="custom-checkbox"
                              />
                            </div>
                            <input
                              type="text"
                              value={item.text}
                              onChange={(e) => handleListItemChange(index, e.target.value)}
                              className="list-item-input"
                              placeholder="¿Qué necesitas hacer?"
                            />
                            <button 
                              className="remove-item-button" 
                              onClick={() => handleRemoveListItem(index)}
                              title="Eliminar tarea"
                            >
                              🗑️
                            </button>
                          </div>
                        ))
                      )}
                      <button className="add-item-button" onClick={handleAddListItem}>
                        <span className="add-icon">+</span>
                        <span>Añadir nueva tarea</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Etiquetas */}
                <div className="input-group">
                  <label className="input-label">
                    <span className="label-icon">🏷️</span>
                    Etiquetas
                  </label>
                  <div className="tag-input-container">
                    <input
                      type="text"
                      className="detail-input-tags"
                      value={tagsInput}
                      onChange={handleTagInputChange}
                      placeholder="trabajo, personal, importante..."
                    />
                    {tagsInput.split(',').pop().trim() !== '' && filteredTagSuggestions.length > 0 && (
                      <div className="tag-suggestions">
                        <div className="suggestions-header">Sugerencias:</div>
                        <div className="suggestions-list">
                          {filteredTagSuggestions.map(tag => (
                            <span
                              key={tag.id}
                              className="tag-suggestion-pill"
                              onClick={() => handleAddTagFromSuggestion(tag.name)}
                              style={{ backgroundColor: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Configuraciones */}
                <div className="input-group">
                  <label className="input-label">
                    <span className="label-icon">⚙️</span>
                    Configuración
                  </label>
                  <div className="note-status-controls">
                    <label className="status-control">
                      <input
                        type="checkbox"
                        checked={isFixed}
                        onChange={() => setIsFixed(!isFixed)}
                        className="status-checkbox"
                      />
                      <span className="status-label">
                        <span className="status-icon">📌</span>
                        Fijar nota
                      </span>
                      <span className="status-description">Aparecerá al inicio de tus notas</span>
                    </label>
                    <label className="status-control">
                      <input
                        type="checkbox"
                        checked={isUnread}
                        onChange={() => setIsUnread(!isUnread)}
                        className="status-checkbox"
                      />
                      <span className="status-label">
                        <span className="status-icon">🔍</span>
                        Marcar para revisar
                      </span>
                      <span className="status-description">Recordatorio para revisar después</span>
                    </label>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* MODO VISTA MEJORADO */}
              <div className="view-container">
                {/* Header de vista */}
                <div className="note-view-header">
                  <h1 className="note-view-title">
                    {note.title || (noteType === 'list' ? 'Lista sin título' : 'Nota sin título')}
                  </h1>
                  
                  {/* Badges de estado */}
                  <div className="note-view-status">
                    {note.isFixed && (
                      <span className="status-badge fixed">
                        <span className="badge-icon">📌</span>
                        Fijada
                      </span>
                    )}
                    {note.isUnread && (
                      <span className="status-badge unread">
                        <span className="badge-icon">🔍</span>
                        Por revisar
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadatos */}
                <div className="note-metadata">
                  <div className="metadata-item">
                    <span className="metadata-icon">📅</span>
                    <span>Actualizada: {note.updatedAt ? new Date(note.updatedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Fecha no disponible'}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-icon">{noteType === 'list' ? '📋' : '📄'}</span>
                    <span>{noteType === 'list' ? 'Lista de tareas' : 'Nota de texto'}</span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="content-section">
                  {note.type === 'text' && note.content ? (
                    <div className="note-view-content">
                      <div className="content-header">
                        <span className="content-icon">💭</span>
                        <span className="content-title">Contenido</span>
                      </div>
                      <div className="content-text">
                        {note.content.split('\n').map((line, index) => (
                          <p key={index}>{line || '\u00A0'}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {note.type === 'list' && note.listItems && note.listItems.length > 0 ? (
                    <div className="list-view-container">
                      <div className="list-header">
                        <span className="list-icon">📋</span>
                        <span className="list-title">
                          Lista de tareas
                        </span>
                        <span className="list-progress">
                          {note.listItems.filter(item => item.completed).length}/{note.listItems.length} completadas
                        </span>
                      </div>
                      
                      {/* Barra de progreso */}
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${(note.listItems.filter(item => item.completed).length / note.listItems.length) * 100}%` 
                          }}
                        ></div>
                      </div>

                      <ul className="note-view-list">
                        {note.listItems.map((item, index) => (
                          <li key={index} className={`list-view-item ${item.completed ? 'completed' : ''}`}>
                            <span className="item-checkbox">
                              {item.completed ? '✅' : '⬜'}
                            </span>
                            <span className="item-text">{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {/* Estado vacío */}
                  {!note.content && (!note.listItems || note.listItems.length === 0) && (
                    <div className="empty-content-state">
                      <div className="empty-content-icon">
                        {noteType === 'list' ? '📋' : '📝'}
                      </div>
                      <h3>Esta nota está vacía</h3>
                      <p>
                        {noteType === 'list' 
                          ? 'Añade algunas tareas para organizar tu trabajo'
                          : 'Escribe algo para darle vida a esta nota'
                        }
                      </p>
                      <button 
                        className="edit-from-empty" 
                        onClick={() => setIsEditing(true)}
                      >
                        <span>✏️</span>
                        Empezar a escribir
                      </button>
                    </div>
                  )}
                </div>

                {/* Etiquetas */}
                {note.tags && note.tags.length > 0 && (
                  <div className="tags-section">
                    <div className="tags-header">
                      <span className="tags-icon">🏷️</span>
                      <span className="tags-title">Etiquetas</span>
                    </div>
                    <div className="note-view-tags">
                      {note.tags.map((tag, index) => (
                        <span key={index} className="view-tag-pill">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer mejorado */}
        <div className="modal-footer">
          {isEditing ? (
            <div className="footer-actions editing">
              <button className="cancel-button" onClick={() => setIsEditing(false)}>
                <span>❌</span>
                Cancelar
              </button>
              <button className="save-button" onClick={handleSave}>
                <span>💾</span>
                Guardar
              </button>
            </div>
          ) : (
            <div className="footer-actions viewing">
              <button className="edit-button" onClick={() => setIsEditing(true)}>
                <span>✏️</span>
                Editar Nota
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NoteDetail;