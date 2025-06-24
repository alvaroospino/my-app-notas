// src/components/NoteList.jsx
import React, { useState } from "react";
import "./NoteList.css";
import Modal from "./Modal";

function NoteList({
  notes,
  onNoteClick,
  onArchiveNote,
  onDeleteNote,
  onRestoreNote,
  onPermanentlyDeleteNote,
  currentFilter,
  showToast,
  allNotes = [],
}) {
  const [confirmAction, setConfirmAction] = useState(null);

  const handleConfirm = () => {
    if (confirmAction) {
      const { fn, noteId, message } = confirmAction;
      fn(noteId);
      setConfirmAction(null);
      setTimeout(() => {
        showToast(message);
      }, 0);
    }
  };

  const handleCancel = () => {
    setConfirmAction(null);
  };

  // Calcular estadísticas
  const getStats = () => {
    // Si no tenemos allNotes, usar las notas actuales como fallback
    const notesToCount = allNotes && allNotes.length > 0 ? allNotes : notes || [];
    
    if (notesToCount.length === 0) return { totalNotes: 0, totalLists: 0, totalTexts: 0 };
    
    // Filtrar notas activas (no archivadas ni eliminadas)
    const activeNotes = notesToCount.filter(note => 
      !note.isArchived && !note.isDeleted && !note.inTrash
    );
    
    const totalNotes = activeNotes.length;
    const totalLists = activeNotes.filter(note => note.type === 'list').length;
    const totalTexts = activeNotes.filter(note => note.type === 'text' || !note.type).length;
    
    return { totalNotes, totalLists, totalTexts };
  };

  const stats = getStats();


  // Estado vacío mejorado
  if (!notes || notes.length === 0) {
    let message = "¡No tienes notas aún! Crea una para empezar.";
    let icon = "📝";
    let suggestion = "Haz clic en el botón '+' para crear tu primera nota";
    
    if (currentFilter === "unread") {
      message = "No hay notas marcadas 'A Revisar'";
      icon = "👀";
      suggestion = "Las notas nuevas aparecerán aquí automáticamente";
    }
    if (currentFilter === "fixed") {
      message = "No tienes notas fijadas";
      icon = "📌";
      suggestion = "Fija notas importantes para acceso rápido";
    }
    if (currentFilter === "old") {
      message = "No hay notas antiguas";
      icon = "🕰️";
      suggestion = "Las notas de hace más de 30 días aparecerán aquí";
    }
    if (currentFilter === "archived") {
      message = "No hay notas archivadas";
      icon = "📦";
      suggestion = "Las notas archivadas se guardan aquí";
    }
    if (currentFilter === "trash") {
      message = "La papelera está vacía";
      icon = "🗑️";
      suggestion = "Las notas eliminadas se almacenan aquí temporalmente";
    }

    return (
      <div className="app-container">
        {/* Tarjetas de estadísticas - solo mostrar en vista principal */}
        {currentFilter === "all" && (
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-number">{stats.totalNotes}</div>
                <div className="stat-label">Total Notas</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <div className="stat-number">{stats.totalLists}</div>
                <div className="stat-label">Listas</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📄</div>
              <div className="stat-content">
                <div className="stat-number">{stats.totalTexts}</div>
                <div className="stat-label">Notas de Texto</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">{icon}</div>
            <h2 className="empty-state-title">{message}</h2>
            <p className="empty-state-description">{suggestion}</p>
            {currentFilter === "all" && (
              <div className="empty-state-features">
                <div className="feature-item">
                  <span className="feature-icon">✍️</span>
                  <span>Crea notas de texto rápidas</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✅</span>
                  <span>Organiza tareas con listas</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🏷️</span>
                  <span>Etiqueta y categoriza</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Tarjetas de estadísticas - solo en vista principal con notas */}
      {currentFilter === "all" && (
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalNotes}</div>
              <div className="stat-label">Total Notas</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalLists}</div>
              <div className="stat-label">Listas</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalTexts}</div>
              <div className="stat-label">Notas de Texto</div>
            </div>
          </div>
        </div>
      )}

      <div className="note-list">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`note-card 
              ${note.isUnread ? "note-unread" : ""} 
              ${note.isOld ? "note-old" : ""} 
              ${note.type === "list" ? "note-list-type" : "note-text-type"}`}
            onClick={() => onNoteClick(note.id)}
          >
            <div className="note-card-header">
              <h3>
                {note.title ||
                  (note.type === "list" ? "Lista sin título" : "Nota sin título")}
              </h3>
              <div className="note-icons">
                {note.isFixed && (
                  <span className="fixed-indicator" title="Nota Fijada">
                    📌
                  </span>
                )}
                {note.isUnread && (
                  <span className="unread-indicator" title="Nota sin leer">
                    ● Nueva
                  </span>
                )}
                {note.isOld && (
                  <span className="old-indicator" title="Nota Antigua">
                    🕰️
                  </span>
                )}
                {note.type === "list" && (
                  <span className="note-type-icon" title="Nota de Lista">
                    📋
                  </span>
                )}
              </div>
            </div>

            {note.type === "text" && (
              <p>
                {note.content?.substring(0, 100)}
                {note.content && note.content.length > 100 ? "..." : ""}
              </p>
            )}

            {note.type === "list" && (
              <ul className="note-list-preview">
                {note.listItems?.slice(0, 3).map((item, index) => (
                  <li key={index} className={item.completed ? "completed" : ""}>
                    <span className="checkbox-icon">
                      {item.completed ? "✅" : "⬜"}
                    </span>{" "}
                    {item.text}
                  </li>
                ))}
                {note.listItems && note.listItems.length > 3 && (
                  <li>... y {note.listItems.length - 3} más</li>
                )}
                {!note.listItems ||
                  (note.listItems.length === 0 && <li>Sin ítems</li>)}
              </ul>
            )}

            <div className="note-tags">
              {note.tags &&
                note.tags.map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
            </div>
            <small>
              Última edición:{" "}
              {note.updatedAt ? new Date(note.updatedAt).toLocaleString() : "N/A"}
            </small>

            <div className="note-actions" onClick={(e) => e.stopPropagation()}>
              {/* Acciones para notas en la vista principal */}
              {currentFilter !== "archived" && currentFilter !== "trash" && (
                <>
                  <button
                    onClick={() =>
                      setConfirmAction({
                        fn: onArchiveNote,
                        noteId: note.id,
                        message: "Nota archivada exitosamente.",
                      })
                    }
                    title="Archivar Nota"
                  >
                    📦
                  </button>

                  <button
                    onClick={() =>
                      setConfirmAction({ 
                        fn: onDeleteNote, 
                        noteId: note.id,
                        message: "Nota enviada ha papelera exitosamente.", 
                      })
                    }
                    title="Mover a Papelera"
                  >
                    🗑️
                  </button>
                </>
              )}

              {/* Acciones para notas archivadas */}
              {currentFilter === "archived" && (
                <>
                 <button
                  onClick={() => {
                      onRestoreNote(note.id);
                      showToast("Nota restaurada.");
                  }}
                  title="Restaurar Nota"
                  >
                  ↩️
                  </button>

                  <button
                    onClick={() => onDeleteNote(note.id)}
                    title="Mover a Papelera"
                  >
                    🗑️
                  </button>
                </>
              )}

              {/* Acciones para notas en papelera */}
              {currentFilter === "trash" && (
                <>
                  <button
                    onClick={() => onRestoreNote(note.id)}
                    title="Restaurar de Papelera"
                  >
                    ↩️
                  </button>
                  <button
                    onClick={() =>
                      setConfirmAction({
                        fn: onPermanentlyDeleteNote,
                        noteId: note.id,
                        message: "Nota eliminada permanentemente.",
                      })
                    }
                    title="Eliminar Permanentemente"
                  >
                    🔥
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {confirmAction && (
          <Modal
            message="¿Estás seguro de que deseas realizar esta acción?"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}

export default NoteList;