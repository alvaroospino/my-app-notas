// src/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'; // Importa enableIndexedDbPersistence
import { getAuth } from 'firebase/auth';

// Tu objeto de configuración de Firebase copiado de la consola
const firebaseConfig = {
 apiKey: "AIzaSyBfIRoN83grFHAdScDPr0zsyEYmGoFmSB4",
 authDomain: "notas-app-71876.firebaseapp.com",
 projectId: "notas-app-71876",
 storageBucket: "notas-app-71876.firebasestorage.app",
 messagingSenderId: "818311080035",
 appId: "1:818311080035:web:a5d376e69b8d2b8e603056"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios que usaremos
export const db = getFirestore(app); // Para la base de datos Firestore
export const auth = getAuth(app);    // Para la autenticación de usuarios

// Habilita la persistencia offline de Firestore
// **IMPORTANTE**: Llama a esto ANTES de realizar cualquier operación con 'db'
enableIndexedDbPersistence(db)
  .then(() => {
    console.log("Persistencia offline de Firestore habilitada con éxito.");
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Usualmente ocurre si tienes múltiples pestañas de la misma app abiertas.
      // La persistencia solo se puede habilitar una vez por navegador/app.
      console.warn("No se pudo habilitar la persistencia offline: Múltiples pestañas abiertas o ya habilitada.");
    } else if (err.code === 'unimplemented') {
      // El navegador no es compatible con todas las características necesarias
      // para la persistencia sin conexión (muy raro hoy en día).
      console.warn("El navegador no es compatible con la persistencia offline de Firestore.");
    } else {
      console.error("Error al habilitar la persistencia offline:", err);
    }
  });