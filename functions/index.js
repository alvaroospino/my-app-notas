// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp(); // Inicializa el SDK de Admin de Firebase

// Configura el transportador de correo con tus credenciales SMTP
// ADVERTENCIA: NO PONGAS TUS CREDENCIALES DIRECTAMENTE AQUÍ.
// Usa variables de entorno de Cloud Functions o Firebase Secret Manager.
// Ejemplo con variables de entorno (configúralas con `firebase functions:config:set gmail.user="TU_EMAIL" gmail.pass="TU_APP_PASSWORD"`):
const transporter = nodemailer.createTransport({
  service: 'gmail', // O el servicio SMTP que uses
  auth: {
    user: functions.config().gmail.user, // Tu correo Gmail
    pass: functions.config().gmail.pass  // Contraseña de aplicación de Gmail (no tu contraseña normal)
  }
});

exports.sendWelcomeEmailOnVerified = functions.auth.user().onUpdate(async (change, context) => {
  const oldUser = change.before;
  const newUser = change.after;

  // Solo si el usuario ha sido verificado y antes no lo estaba
  if (!oldUser.emailVerified && newUser.emailVerified) {
    const email = newUser.email;
    const displayName = newUser.displayName || email; // Usa el displayName o el email si no hay displayName

    const mailOptions = {
      from: 'Mi Aplicación <no-reply@tudominio.com>', // O tu_correo@gmail.com
      to: email,
      subject: '¡Bienvenido a Mi Aplicación!',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #4CAF50;">¡Hola ${displayName}!</h2>
          <p>Nos complace darte la bienvenida a **Mi Aplicación**.</p>
          <p>Tu correo electrónico ha sido verificado exitosamente. ¡Gracias por unirte a nuestra comunidad!</p>
          <p>Explora todas las funcionalidades que hemos preparado para ti.</p>
          <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
          <p>Saludos cordiales,</p>
          <p>El equipo de Mi Aplicación</p>
          <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; font-size: 0.9em; color: #777;">
            Este es un correo automático, por favor no respondas a este mensaje.
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Correo de bienvenida enviado a ${email}`);
    } catch (error) {
      console.error(`Error al enviar el correo de bienvenida a ${email}:`, error);
    }
  }
  return null;
});