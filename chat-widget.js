// Custom Firebase Support Chat Widget
// Attaches a UI and syncs messages with Firestore 'supportChats' collection
document.addEventListener('DOMContentLoaded', () => {
    // 1. Create and inject chat HTML structure
    const chatContainer = document.createElement('div');
    chatContainer.id = 'pv-chat-widget';
    
    chatContainer.innerHTML = `
      <!-- Toggle Button -->
      <button id="pv-chat-toggle" aria-label="Open Chat">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
        <svg class="pv-chat-close-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
        <div id="pv-chat-badge" style="display: none;">0</div>
      </button>
  
      <!-- Chat Window -->
      <div id="pv-chat-window">
        <!-- Header -->
        <div id="pv-chat-header">
          <div id="pv-chat-header-top">
            <h3 id="pv-chat-title">
              <svg style="width:20px;height:20px;fill:white;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
              Support Chat
            </h3>
            <!-- Close button for mobile -->
            <button id="pv-chat-close-btn" style="background:none;border:none;color:white;cursor:pointer;">
              <svg style="width:24px;height:24px;fill:white;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
          <div id="pv-chat-status">
            <span class="pv-status-dot"></span> Online and ready to help
          </div>
        </div>
        
        <!-- Messages -->
        <div id="pv-chat-messages">
          <!-- Welcome message -->
          <div class="pv-message support">
            Welcome to Prime Vault Support! How can we assist you today?
          </div>
        </div>
        
        <!-- Input Area -->
        <div id="pv-chat-input-area">
          <input type="text" id="pv-chat-input" placeholder="Type your message here..." autocomplete="off">
          <button id="pv-chat-send" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(chatContainer);
  
    // Variables
    let currentUserId = null;
    let unsubscribeMessages = null;
    const toggleBtn = document.getElementById('pv-chat-toggle');
    const chatWindow = document.getElementById('pv-chat-window');
    const closeBtn = document.getElementById('pv-chat-close-btn');
    const inputField = document.getElementById('pv-chat-input');
    const sendBtn = document.getElementById('pv-chat-send');
    const messagesArea = document.getElementById('pv-chat-messages');
    
    // UI Interactions
    const toggleChat = () => {
      toggleBtn.classList.toggle('pv-chat-open');
      chatWindow.classList.toggle('pv-chat-open');
      if (chatWindow.classList.contains('pv-chat-open')) {
        inputField.focus();
        scrollToBottom();
      }
    };
    
    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', () => {
      if (chatWindow.classList.contains('pv-chat-open')) toggleChat();
    });
    
    inputField.addEventListener('input', () => {
      sendBtn.disabled = inputField.value.trim().length === 0;
    });
    
    inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !sendBtn.disabled) {
        sendMessage();
      }
    });
    
    sendBtn.addEventListener('click', sendMessage);
    
    function scrollToBottom() {
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }
  
    // Utility format time
    function formatTime(date) {
        return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(date);
    }
  
    function appendMessage(text, type, timestamp = new Date()) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `pv-message ${type}`;
      msgDiv.innerText = text;
      
      const timeSpan = document.createElement('span');
      timeSpan.className = 'pv-message-time';
      timeSpan.innerText = formatTime(timestamp);
      
      msgDiv.appendChild(timeSpan);
      messagesArea.appendChild(msgDiv);
      scrollToBottom();
    }
    
    // Firebase Integration
    function initFirebaseChat() {
      if (!window.db || !window.auth || !window.firebase) {
        console.log("Waiting for Firebase to initialize completely...");
        setTimeout(initFirebaseChat, 500);
        return;
      }
  
      console.log("Firebase Chat Widget connected.");
  
      window.auth.onAuthStateChanged(async (user) => {
        if (user) {
          setupChatForUser(user.uid, user.email || user.displayName || 'User');
        } else {
          // If no user, we might try anonymous signin so they can chat anyway.
          try {
            const userCredential = await window.auth.signInAnonymously();
            setupChatForUser(userCredential.user.uid, 'Guest');
          } catch (error) {
            console.error("Anonymous authentication failed", error);
            inputField.placeholder = "Please log in to chat.";
            inputField.disabled = true;
          }
        }
      });
    }
  
    function setupChatForUser(uid, displayName) {
      if (currentUserId === uid) return;
      currentUserId = uid;
      
      // Clear previous messages
      messagesArea.innerHTML = `<div class="pv-message support">Welcome to Prime Vault Support! How can we assist you today, ${displayName}?</div>`;
      
      if (unsubscribeMessages) unsubscribeMessages();
      inputField.disabled = false;
      inputField.placeholder = "Type your message here...";
  
      // Ensure user document exists in supportChats
      window.db.collection('supportChats').doc(uid).set({
        displayName: displayName,
        lastActive: window.firebase.firestore.FieldValue.serverTimestamp(),
        unreadCountAdmin: 0
      }, { merge: true });
  
      // Listen to messages
      unsubscribeMessages = window.db.collection('supportChats')
        .doc(uid)
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    const dateObj = data.timestamp ? data.timestamp.toDate() : new Date();
                    appendMessage(data.text, data.sender === 'user' ? 'user' : 'support', dateObj);
                }
            });
        });
    }
  
    async function sendMessage() {
      if (!currentUserId) return;
      
      const text = inputField.value.trim();
      if (!text) return;
      
      inputField.value = '';
      sendBtn.disabled = true;
      
      try {
        await window.db.collection('supportChats')
          .doc(currentUserId)
          .collection('messages')
          .add({
            text: text,
            sender: 'user',
            timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
          });
          
        // Update lastActive
        await window.db.collection('supportChats').doc(currentUserId).update({
            lastActive: window.firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (error) {
        console.error("Error sending message", error);
        appendMessage("System: Message failed to send. Please try again.", "support");
      }
    }
  
    // Start trying to initialize Firebase chat
    initFirebaseChat();
  });
