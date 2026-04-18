const admin = require('firebase-admin');
require('dotenv').config();

/**
 * Initialize Firebase Admin for token verification.
 * We use the credentials already provided in the .env file.
 */
if (!admin.apps.length) {
  try {
    // Helper to strip quotes if present in .env
    const clean = (val) => val ? val.replace(/^["']|["']$/g, '') : undefined;

    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n')
      : undefined;

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: clean(process.env.FIREBASE_PROJECT_ID),
        clientEmail: clean(process.env.FIREBASE_CLIENT_EMAIL),
        privateKey: privateKey,
      }),
    });
    console.log('[FIREBASE] Admin initialized and ready.');
  } catch (error) {
    console.error('[FIREBASE] Admin init error:', error.message);
  }
}

module.exports = admin;
