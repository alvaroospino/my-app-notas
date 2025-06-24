// src/App.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "./firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  doc,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signOut,
  updateProfile,
  updatePassword,
} from "firebase/auth";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import NoteForm from "./components/NoteForm";
import NoteList from "./components/NoteList";
import Auth from "./components/Auth";
import NoteDetail from "./components/NoteDetail";
import TagManager from "./components/TagManager";
import ProfilePage from "./components/ProfilePage";
import Toast from "./components/Toast";
import "./App.css";

function App() {
  const [notes, setNotes] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");
  const [userTags, setUserTags] = useState([]);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [profilePageOpen, setProfilePageOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Estado para la conexión a internet, inicializado con el estado actual del navegador
  const [isOnline, setIsOnline] = useState(navigator.onLine); //

  // Estado para los mensajes de toast. Ahora almacena un objeto { message: string, type: string }
  const [toastMessage, setToastMessage] = useState(null);

  // --- Función para mostrar mensajes de toast ---
  // Ahora acepta un 'type' para el estilo del toast (success, error, warning, info)
  const showToast = (msg, type = 'success') => { //
    setToastMessage({ message: msg, type: type }); //
  };

  // --- Efecto para monitorear la conexión a internet ---
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true); // Actualiza el estado a online
      showToast("Estás conectado a internet.", 'success'); // Muestra Toast de éxito
    };

    const handleOffline = () => {
      setIsOnline(false); // Actualiza el estado a offline
      showToast("¡Has perdido la conexión a internet!", 'error'); // Muestra Toast de error
    };

    // Añade los event listeners al cargar el componente
    window.addEventListener('online', handleOnline); //
    window.addEventListener('offline', handleOffline); //

    // Asegúrate de que el estado inicial sea correcto al montar el componente
    // Esto es crucial para que el icono se muestre correctamente desde el principio
    setIsOnline(navigator.onLine); //

    // Limpieza de los listeners al desmontar el componente
    return () => {
      window.removeEventListener('online', handleOnline); //
      window.removeEventListener('offline', handleOffline); //
    };
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez al montar


  // --- 1. Escuchar cambios en el estado de autenticación ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setNotes([]);
        setUserTags([]);
        setSelectedNote(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // --- Cierra el sidebar automáticamente cuando el usuario inicia sesión ---
useEffect(() => {
  if (currentUser) {
    setIsSidebarOpen(false);
  }
}, [currentUser]);

  // --- 2. Obtener notas y etiquetas de Firestore para el usuario actual y aplicar filtros ---
  useEffect(() => {
    let unsubscribeNotes;
    let unsubscribeTags;

    if (currentUser) {
      const userNotesCollectionRef = collection(
        db,
        "users",
        currentUser.uid,
        "notes"
      );
      let notesQuery;

      switch (currentFilter) {
        case "unread":
          notesQuery = query(
            userNotesCollectionRef,
            where("isUnread", "==", true),
            where("isDeleted", "==", false),
            where("isArchived", "==", false),
            orderBy("createdAt", "desc")
          );
          break;
        case "fixed":
          notesQuery = query(
            userNotesCollectionRef,
            where("isFixed", "==", true),
            where("isDeleted", "==", false),
            where("isArchived", "==", false),
            orderBy("createdAt", "desc")
          );
          break;
        case "archived":
          notesQuery = query(
            userNotesCollectionRef,
            where("isArchived", "==", true),
            where("isDeleted", "==", false),
            orderBy("createdAt", "desc")
          );
          break;
        case "trash":
          notesQuery = query(
            userNotesCollectionRef,
            where("isDeleted", "==", true),
            orderBy("createdAt", "desc")
          );
          break;
        case "all":
        default:
          notesQuery = query(
            userNotesCollectionRef,
            where("isDeleted", "==", false),
            where("isArchived", "==", false),
            orderBy("createdAt", "desc")
          );
          break;
      }

      unsubscribeNotes = onSnapshot(
        notesQuery,
        (snapshot) => {
          const fetchedNotes = snapshot.docs.map((doc) => {
            const data = doc.data();
            const createdAt = data.createdAt
              ? data.createdAt.toDate()
              : new Date();
            const updatedAt = data.updatedAt
              ? data.updatedAt.toDate()
              : new Date();
            const lastViewedAt = data.lastViewedAt
              ? data.lastViewedAt.toDate()
              : null;

            const now = new Date();
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(now.getDate() - 90);
            const isOld =
              updatedAt < ninetyDaysAgo && !data.isArchived && !data.isDeleted;

            return {
              id: doc.id,
              ...data,
              createdAt,
              updatedAt,
              lastViewedAt,
              isOld: isOld,
              isFixed: data.isFixed || false,
              isUnread: data.isUnread || false,
              isArchived: data.isArchived || false,
              isDeleted: data.isDeleted || false,
            };
          });

          let finalNotes = fetchedNotes;
          if (currentFilter === "old") {
            finalNotes = fetchedNotes.filter((note) => note.isOld);
          }

          const filteredBySearch = finalNotes.filter(
            (note) =>
              note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (note.tags &&
                note.tags.some((tag) =>
                  tag.toLowerCase().includes(searchTerm.toLowerCase())
                )) ||
              (note.type === "list" &&
                note.listItems?.some((item) =>
                  item.text.toLowerCase().includes(searchTerm.toLowerCase())
                ))
          );

          filteredBySearch.sort((a, b) => {
            if (a.isFixed && !b.isFixed) return -1;
            if (!a.isFixed && b.isFixed) return 1;
            const aUpdated =
              a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
            const bUpdated =
              b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
            return bUpdated - aUpdated;
          });

          setNotes(filteredBySearch);
        },
        (error) => {
          console.error("Error al obtener notas:", error);
        }
      );

      const userTagsCollectionRef = collection(
        db,
        "users",
        currentUser.uid,
        "tags"
      );
      unsubscribeTags = onSnapshot(
        userTagsCollectionRef,
        (snapshot) => {
          const tagsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUserTags(tagsData);
        },
        (error) => {
          console.error("Error al obtener etiquetas:", error);
        }
      );
    } else {
      if (unsubscribeNotes) {
        unsubscribeNotes();
      }
      if (unsubscribeTags) {
        unsubscribeTags();
      }
    }
    return () => {
      if (unsubscribeNotes) {
        unsubscribeNotes();
      }
      if (unsubscribeTags) {
        unsubscribeTags();
      }
    };
  }, [currentUser, currentFilter, searchTerm]);

  // --- Funciones de Manejo de Notas (CRUD y estados) ---
  const handleSaveNote = async (newNoteData) => {
    if (!currentUser) {
      console.error("No hay usuario autenticado.");
      return;
    }
    try {
      const userNotesCollectionRef = collection(
        db,
        "users",
        currentUser.uid,
        "notes"
      );
      await addDoc(userNotesCollectionRef, {
        ...newNoteData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isUnread: true,
        lastViewedAt: null,
        isFixed: false,
        isArchived: false,
        isDeleted: false,
      });
      console.log("Nota guardada con éxito para", currentUser.email);
      showToast("Nota guardada con éxito.", 'success'); // Ahora con tipo
      setShowNoteForm(false);
    } catch (error) {
      console.error("Error al guardar la nota: ", error);
      showToast("Error al guardar la nota: ", 'error'); // Ahora con tipo
    }
  };

  const handleNoteClick = async (noteId) => {
    if (!currentUser) {
      console.error("No hay usuario autenticado.");
      return;
    }
    try {
      const clickedNote = notes.find((note) => note.id === noteId);
      if (clickedNote) {
        setSelectedNote(clickedNote);

        if (clickedNote.isUnread) {
          const noteDocRef = doc(db, "users", currentUser.uid, "notes", noteId);
          await updateDoc(noteDocRef, {
            isUnread: false,
            lastViewedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          showToast("Nota marcada como leída.", 'success'); // Ahora con tipo
        }
      }
    } catch (error) {
      console.error("Error al abrir/marcar nota como leída: ", error);
      showToast("Error al abrir la nota.", 'error'); // Ahora con tipo
    }
  };

  const handleUpdateNote = async (noteId, updatedData) => {
    if (!currentUser) {
      console.error("No hay usuario autenticado.");
      return;
    }
    try {
      const noteDocRef = doc(db, "users", currentUser.uid, "notes", noteId);
      await updateDoc(noteDocRef, {
        ...updatedData,
        updatedAt: serverTimestamp(),
      });
      console.log(`Nota ${noteId} actualizada con éxito.`);
      showToast("Nota actualizada con éxito.", 'success'); // Ahora con tipo
    } catch (error) {
      console.error("Error al actualizar la nota: ", error);
      showToast("Error al actualizar la nota: ", 'error'); // Ahora con tipo
    }
  };

  const handleCloseDetail = () => {
    setSelectedNote(null);
  };

  const handleArchiveNote = async (noteId) => {
    try { // Añadir try-catch para toasts aquí también
        await handleUpdateNote(noteId, { isArchived: true, isFixed: false });
        showToast("Nota archivada correctamente.", 'success');
    } catch (error) {
        console.error("Error al archivar la nota:", error);
        showToast("Error al archivar la nota.", 'error');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try { // Añadir try-catch para toasts aquí también
        await handleUpdateNote(noteId, { isDeleted: true, isFixed: false, isArchived: false });
        showToast("Nota movida a la papelera.", 'success');
    } catch (error) {
        console.error("Error al mover la nota a la papelera:", error);
        showToast("Error al mover la nota a la papelera.", 'error');
    }
  };

  const handleRestoreNote = async (noteId) => {
    try { // Añadir try-catch para toasts aquí también
        await handleUpdateNote(noteId, { isDeleted: false, isArchived: false, isUnread: true });
        showToast("Nota restaurada correctamente.", 'success');
    } catch (error) {
        console.error("Error al restaurar la nota:", error);
        showToast("Error al restaurar la nota.", 'error');
    }
  };

  const handlePermanentlyDeleteNote = async (noteId) => {
    if (!currentUser) {
      console.error("No hay usuario autenticado.");
      return;
    }
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar esta nota PERMANENTEMENTE? Esta acción no se puede deshacer."
      )
    ) {
      try {
        const noteDocRef = doc(db, "users", currentUser.uid, "notes", noteId);
        await deleteDoc(noteDocRef);
        console.log(`Nota ${noteId} eliminada permanentemente.`);
        showToast("Nota eliminada permanentemente.", 'success'); // Ahora con tipo
      } catch (error) {
        console.error("Error al eliminar la nota permanentemente: ", error);
        showToast("Error al eliminar la nota permanentemente: ", 'error'); // Ahora con tipo
      }
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleSelectFilter = (filter) => {
    setCurrentFilter(filter);
    setSearchTerm("");
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast("Sesión cerrada correctamente.", 'success'); // Ahora con tipo
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      showToast("Error al cerrar sesión.", 'error'); // Ahora con tipo
    }
  };

  const handleOpenTagManager = () => {
    setIsTagManagerOpen(true);
    setIsSidebarOpen(false);
  };

  const handleCloseTagManager = () => {
    setIsTagManagerOpen(false);
  };

  const handleOpenProfilePage = () => {
    setProfilePageOpen(true);
    setSelectedNote(null);
    setShowNoteForm(false);
    setIsTagManagerOpen(false);
    setIsSidebarOpen(false);
  };

  const handleCloseProfilePage = () => {
    setProfilePageOpen(false);
  };

  const handleUpdateUserProfile = async (newDisplayName) => {
    if (currentUser) {
      try {
        await updateProfile(currentUser, { displayName: newDisplayName });
        setCurrentUser({ ...currentUser, displayName: newDisplayName });
        showToast("Nombre de usuario actualizado con éxito.", 'success'); // Ahora con tipo
      } catch (error) {
        console.error("Error al actualizar el perfil:", error);
        showToast("Error al actualizar el nombre de usuario: " + error.message, 'error'); // Ahora con tipo
      }
    }
  };

  const handleChangePassword = async (newPassword) => {
    if (currentUser) {
      try {
        await updatePassword(currentUser, newPassword);
        showToast("Contraseña actualizada con éxito. Por favor, inicia sesión de nuevo.", 'success'); // Ahora con tipo
        handleLogout();
      } catch (error) {
        console.error("Error al cambiar la contraseña:", error);
        if (error.code === "auth/requires-recent-login") {
          showToast("Por favor, inicia sesión de nuevo para cambiar tu contraseña por seguridad.", 'warning'); // Ahora con tipo
        } else {
          showToast("Error al cambiar la contraseña: " + error.message, 'error'); // Ahora con tipo
        }
      }
    }
  };

  return (
    <div className="app-container">
      {currentUser ? (
        <>
          <Header
            onSearch={handleSearch}
            onToggleSidebar={handleToggleSidebar}
            currentUser={currentUser}
            isOnline={isOnline} 
          />
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={handleToggleSidebar}
            onSelectFilter={handleSelectFilter}
            onOpenTagManager={handleOpenTagManager}
            onLogout={handleLogout}
            onOpenProfilePage={handleOpenProfilePage}
          />
          <main className="app-main-content">
            {showNoteForm && (
              <NoteForm
                onSaveNote={handleSaveNote}
                onClose={() => setShowNoteForm(false)}
                userTags={userTags}
              />
            )}

            {selectedNote && (
              <NoteDetail
                note={selectedNote}
                onClose={() => setSelectedNote(null)}
                onUpdateNote={handleUpdateNote}
                userTags={userTags}
              />
            )}

            {isTagManagerOpen && (
              <TagManager
                currentUser={currentUser}
                onClose={handleCloseTagManager}
                showToast={showToast}
              />
            )}

            {profilePageOpen && (
              <ProfilePage
                currentUser={currentUser}
                onClose={handleCloseProfilePage}
                onUpdateProfile={handleUpdateUserProfile}
                onChangePassword={handleChangePassword}
                onLogout={handleLogout}
              />
            )}

            {!showNoteForm &&
              !selectedNote &&
              !isTagManagerOpen &&
              !profilePageOpen && (
                <>
                  <NoteList
                    notes={notes}
                    onNoteClick={handleNoteClick}
                    onArchiveNote={handleArchiveNote}
                    onDeleteNote={handleDeleteNote}
                    onRestoreNote={handleRestoreNote}
                    onPermanentlyDeleteNote={handlePermanentlyDeleteNote}
                    currentFilter={currentFilter}
                    showToast={showToast}
                  />
                </>
              )}
          </main>
          {currentUser && (
            <button
              className="add-note-button"
              onClick={() => setShowNoteForm((prev) => !prev)}
            >
              {showNoteForm ? "×" : "+"}
            </button>
          )}
          {toastMessage && ( // Renderiza el Toast si toastMessage no es null
            <Toast
              message={toastMessage.message} // Accede a .message
              onClose={() => setToastMessage(null)}
              type={toastMessage.type} // Pasa el tipo al Toast
            />
          )}
        </>
      ) : (
        <Auth currentUser={currentUser} />
      )}
    </div>
  );
}

export default App;