const admin = require('firebase-admin');
const serviceAccount = require(`../${process.env.FIREBASE_CREDENTIALS_FILE}`);

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});


module.exports = { admin }