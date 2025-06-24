// src/components/TagManager.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import './TagManager.css';

// Add showToast to props destructuring
function TagManager({ currentUser, onClose, showToast }) {
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#cccccc');

  // --- Obtener etiquetas del usuario ---
  useEffect(() => {
    if (!currentUser) return;

    const tagsCollectionRef = collection(db, 'users', currentUser.uid, 'tags');
    const q = query(tagsCollectionRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tagsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTags(tagsData);
    }, (error) => {
      console.error("Error al obtener las etiquetas:", error);
      showToast("Error al cargar etiquetas."); // Add toast for error
    });

    return () => unsubscribe();
  }, [currentUser, showToast]); // Add showToast to dependency array

  // --- Añadir nueva etiqueta ---
  const handleAddTag = async () => {
    if (!currentUser || newTagName.trim() === '') {
      showToast("El nombre de la etiqueta no puede estar vacío."); // Toast for empty name
      return;
    }

    try {
      await addDoc(collection(db, 'users', currentUser.uid, 'tags'), {
        name: newTagName.trim(),
        color: newTagColor,
        createdAt: new Date()
      });
      setNewTagName('');
      setNewTagColor('#cccccc');
      showToast("Etiqueta añadida con éxito."); // Success toast
    } catch (error) {
      console.error("Error al añadir etiqueta:", error);
      showToast("Error al añadir etiqueta."); // Error toast
    }
  };

  // --- Actualizar color de etiqueta ---
  const handleUpdateTagColor = async (tagId, newColor) => {
    if (!currentUser) return;
    try {
      const tagDocRef = doc(db, 'users', currentUser.uid, 'tags', tagId);
      await updateDoc(tagDocRef, { color: newColor });
      showToast("Color de etiqueta actualizado."); // Success toast
    } catch (error) {
      console.error("Error al actualizar color de etiqueta:", error);
      showToast("Error al actualizar color de etiqueta."); // Error toast
    }
  };

  // --- Eliminar etiqueta ---
  const handleDeleteTag = async (tagId) => {
    if (!currentUser) return;
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta etiqueta? Las notas que la usen seguirán existiendo, pero la etiqueta no aparecerá con color ni será filtrable por esta etiqueta si se elimina.')) {
      return;
    }
    try {
      const tagDocRef = doc(db, 'users', currentUser.uid, 'tags', tagId);
      await deleteDoc(tagDocRef);
      showToast("Etiqueta eliminada con éxito."); // Success toast
    } catch (error) {
      console.error("Error al eliminar etiqueta:", error);
      showToast("Error al eliminar etiqueta."); // Error toast
    }
  };

  return (
    <div className="tag-manager-overlay">
      <div className="tag-manager-modal">
        <div className="modal-header">
          <h2>Gestión de Etiquetas</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="add-tag-section">
            <input
              type="text"
              placeholder="Nueva etiqueta..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="new-tag-input"
            />
            <input
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
              className="new-tag-color-picker"
            />
            <button onClick={handleAddTag} className="add-tag-button">Añadir Etiqueta</button>
          </div>

          <div className="tag-list-section">
            {tags.length === 0 ? (
              <p className="no-tags-message">Aún no tienes etiquetas. ¡Añade algunas!</p>
            ) : (
              <ul className="tag-list">
                {tags.map(tag => (
                  <li key={tag.id} className="tag-item">
                    <span className="tag-name" style={{ backgroundColor: tag.color }}>{tag.name}</span>
                    <input
                      type="color"
                      value={tag.color}
                      onChange={(e) => handleUpdateTagColor(tag.id, e.target.value)}
                      className="tag-color-picker"
                    />
                    <button onClick={() => handleDeleteTag(tag.id)} className="delete-tag-button">
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default TagManager;