// F:\React_Proyectos\my-notes-app\functions\.eslintrc.js
module.exports = {
  root: true,
  env: {
    es6: true,
    node: true, // <--- ESTA LÍNEA ES FUNDAMENTAL
  },
  extends: [
    'eslint:recommended',
    // 'google', // Descomenta si usas las guías de estilo de Google y tienes 'eslint-config-google' instalado
  ],
  parserOptions: {
    ecmaVersion: 2020, // Asegura que ESLint entiende sintaxis moderna
    sourceType: 'script', // <--- Importante para CommonJS (require/exports)
  },
  rules: {
    quotes: ['error', 'single'],
    // Permite variables como 'context' que no se usan, cambiándolas a advertencia.
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_|context' }], 
  },
  ignorePatterns: [
    '/lib/**/*', // Ignora archivos generados.
  ],
};