document.addEventListener('DOMContentLoaded', () => {
    // Array of files that do not require authentication
    const publicPages = ['login.html', 'index.html', 'home.html', 'account.html', 'forgot-password.html', 'apply.html', 'contact.html', 'about.html', 'termsofservice.html', 'privacy.html', 'verify-account.html'];
    
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    const isPublic = publicPages.includes(page);
    
    // Safety interval to ensure window.auth is populated by firebase.js
    let attempts = 0;
    const authInterval = setInterval(() => {
        attempts++;
        if (window.auth) {
            clearInterval(authInterval);
            
            window.auth.onAuthStateChanged((user) => {
                if (!user && !isPublic && page !== '') {
                    console.warn(`[auth-init] Unauthenticated access to ${page}, redirecting to login...`);
                    // Ensure standard page protection for Dashboard/Cards
                    // Uncomment to enable strict redirect if not already handled by inline scripts:
                    // window.location.href = 'login.html';
                } else if (user) {
                    console.log(`[auth-init] Authenticated as ${user.email} on ${page}.`);
                    
                    if (window.db) {
                        window.db.collection('users').doc(user.uid).get().then((doc) => {
                            if (doc.exists) {
                                const data = doc.data();
                                if (data.accountNumber) {
                                    const accNum = data.accountNumber;
                                    const maskedAccNum = '*'.repeat(Math.max(0, accNum.length - 4)) + accNum.slice(-4);
                                    
                                    document.querySelectorAll('.user-account-number').forEach(el => {
                                        el.textContent = maskedAccNum;
                                    });
                                    
                                    const accInput = document.getElementById('accountnumber');
                                    if (accInput) {
                                        accInput.value = accNum;
                                    }
                                }
                            }
                        }).catch(err => console.error('Error fetching user profile:', err));
                    }
                }
            });
        }
        
        // Stop checking after ~3 seconds to avoid infinite loop
        if (attempts > 30) {
            clearInterval(authInterval);
        }
    }, 100);
});
