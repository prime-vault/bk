const firebaseConfig = {
  apiKey: "AIzaSyCVyyL243cxKqYYfSiBBpEBiCs3I4iVlHw",
  authDomain: "prime-vault-bf73d.firebaseapp.com",
  projectId: "prime-vault-bf73d",
  storageBucket: "prime-vault-bf73d.firebasestorage.app",
  messagingSenderId: "317063080962",
  appId: "1:317063080962:web:875faaeb6ee2af9b3ccb1b",
  measurementId: "G-FSNK0T2ZD3"
};

// Wait until Firebase is actually loaded
function initializeFirebase() {
  if (typeof firebase === 'undefined') {
    console.warn("Firebase SDK not loaded yet.");
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      console.log("Firebase initialized");
    }

    // Assign to globals
    window.auth = firebase.auth();
    window.db   = firebase.firestore();

    if (window.auth && window.db) {
      console.log("auth and db globals are now available from firebase.js");
    }
  } catch (err) {
    console.error("Firebase setup failed:", err.message);
  }
}

// Initial attempt
initializeFirebase();

// Small delay safety net, in case scripts loaded out of order
setTimeout(initializeFirebase, 300);
