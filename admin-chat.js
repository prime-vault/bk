let currentChatUid = null;
let unsubscribeMessages = null;
let chatIsLoading = false;

const userListEl = document.getElementById('user-list');
const chatPane = document.getElementById('chat-pane');
const noChatPane = document.getElementById('no-chat-pane');
const chatUserNameEl = document.getElementById('chat-user-name');
const chatUserUidEl = document.getElementById('chat-user-uid');
const messagesEl = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

function initAdminChat() {
    console.log("Initializing Admin Chat Dashboard...");
    
    // We expect window.db and window.auth to be globally available from the script tag in admin-chat.html
    if (!window.db || !window.auth) {
        console.warn("Firebase not ready yet, retrying...");
        setTimeout(initAdminChat, 500);
        return;
    }

    // Subscribe to supportChats collection to list all users who have initiated a chat
    window.db.collection('supportChats')
        .orderBy('lastActive', 'desc')
        .onSnapshot(snapshot => {
            userListEl.innerHTML = '';
            
            if (snapshot.empty) {
                userListEl.innerHTML = `
                    <div class="p-8 text-center text-sm text-slate-400 mt-10">
                        <i class="fa-solid fa-inbox text-3xl mb-3 text-slate-300"></i><br>
                        No active support chats found.
                    </div>`;
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                const uid = doc.id;
                
                const div = document.createElement('div');
                div.className = 'user-item flex gap-3 items-center';
                if (uid === currentChatUid) div.classList.add('active');
                
                const timeStr = data.lastActive ? formatShortTime(data.lastActive.toDate()) : 'Recently';
                const initial = (data.displayName || 'U').charAt(0).toUpperCase();
                
                div.innerHTML = `
                    <div class="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center shrink-0">
                        ${initial}
                    </div>
                    <div class="flex-grow min-w-0">
                        <div class="flex justify-between items-baseline mb-1">
                            <h4 class="truncate ... max-w-[120px]" title="${data.displayName || 'Unknown'}">${data.displayName || 'Unknown'}</h4>
                            <span class="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">${timeStr}</span>
                        </div>
                        <p class="truncate ... text-slate-400 text-xs">Tap to view messages...</p>
                    </div>
                `;
                
                div.onclick = () => openChat(uid, data.displayName || 'Unknown User');
                userListEl.appendChild(div);
            });
        }, error => {
            console.error("Error fetching chat users:", error);
            userListEl.innerHTML = `<div class="p-4 text-center text-sm text-red-500">
                <i class="fa-solid fa-triangle-exclamation mb-2"></i><br>
                Error loading chats.<br>Ensure you are authenticated and have permission.
            </div>`;
        });
}

function openChat(uid, displayName) {
    if (chatIsLoading && currentChatUid === uid) return;
    currentChatUid = uid;
    chatIsLoading = true;
    
    // Update active state in sidebar
    document.querySelectorAll('.user-item').forEach((el, index) => {
        // Simple heuristic: just look at the list, but it gets redrawn on snapshot anyway
        el.classList.remove('active');
    });
    // Find the one clicked
    const items = [...userListEl.children];
    // This isn't perfect since it redraws, but gives immediate feedback
    
    chatPane.classList.remove('hidden');
    noChatPane.classList.add('hidden');
    
    chatUserNameEl.textContent = displayName;
    chatUserUidEl.textContent = `ID: ${uid}`;
    
    messagesEl.innerHTML = `
        <div class="flex-grow flex items-center justify-center">
            <div class="text-slate-400 text-sm"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading messages...</div>
        </div>`;
    messageInput.value = '';
    messageInput.focus();
    sendBtn.disabled = true;
    
    // Unsubscribe from previous chat listener if any
    if (unsubscribeMessages) unsubscribeMessages();
    
    // Subscribe to user's messages subcollection
    unsubscribeMessages = window.db.collection('supportChats')
        .doc(uid)
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
            chatIsLoading = false;
            messagesEl.innerHTML = '';
            
            if (snapshot.empty) {
                messagesEl.innerHTML = `
                    <div class="flex-grow flex items-center justify-center">
                        <div class="text-slate-400 text-sm text-center">
                            No messages in this conversation yet.<br>Send a message below to start.
                        </div>
                    </div>`;
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                // If it's sent by 'support', it goes on the right
                const type = data.sender === 'support' ? 'support' : 'user';
                const dateObj = data.timestamp ? data.timestamp.toDate() : new Date();
                
                appendMessage(data.text, type, dateObj);
            });
            
            scrollToBottom();
        }, error => {
            chatIsLoading = false;
            console.error("Error loading messages:", error);
            messagesEl.innerHTML = `<div class="text-center text-sm text-red-500 my-4">Error loading messages: ${error.message}</div>`;
        });
}

function closeChat() {
    currentChatUid = null;
    if (unsubscribeMessages) {
        unsubscribeMessages();
        unsubscribeMessages = null;
    }
    chatPane.classList.add('hidden');
    noChatPane.classList.remove('hidden');
    document.querySelectorAll('.user-item').forEach(el => el.classList.remove('active'));
}

function appendMessage(text, type, timestamp) {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerText = text;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'msg-time';
    timeSpan.innerText = formatTime(timestamp);
    
    div.appendChild(timeSpan);
    messagesEl.appendChild(div);
}

function scrollToBottom() {
    // Only scroll if we are not manually scrolling up?
    // For simplicity, always scroll right now
    messagesEl.scrollTo({
        top: messagesEl.scrollHeight,
        behavior: 'smooth'
    });
}

// Helpers
function formatTime(date) {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(date);
}

function formatShortTime(date) {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        return formatTime(date);
    }
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

// Sending messages logic
messageInput.addEventListener('input', () => {
    sendBtn.disabled = messageInput.value.trim().length === 0;
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !sendBtn.disabled && !e.shiftKey) {
        e.preventDefault(); // Prevent newline if it was a textarea
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

async function sendMessage() {
    if (!currentChatUid || sendBtn.disabled) return;
    
    const text = messageInput.value.trim();
    if (!text) return;
    
    messageInput.value = '';
    sendBtn.disabled = true;
    messageInput.focus();
    
    // Instead of optimistic append, we'll let Firestore snapshot handle it so we get the correct timestamp immediately
    // Or we could optimistically append if it feels slow, but local snapshot fires almost instantly.
    const now = new Date();
    
    try {
        await window.db.collection('supportChats')
            .doc(currentChatUid)
            .collection('messages')
            .add({
                text: text,
                sender: 'support',
                timestamp: window.firebase.firestore.FieldValue.serverTimestamp()
            });
            
        // Update the lastActive time of the support chat document so it floats to the top of the sidebar
        await window.db.collection('supportChats').doc(currentChatUid).set({
            lastActive: window.firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
    } catch (error) {
        console.error("Failed to send message:", error);
        alert("Failed to send message. Check console for details.");
        
        // Restore text on failure
        messageInput.value = text;
        sendBtn.disabled = false;
    }
}

// Start listener after slight delay to ensure window.db is populated
setTimeout(initAdminChat, 1000);
