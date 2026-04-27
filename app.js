// app.js - Central logic for DigiRaksha navigation and state management

document.addEventListener('DOMContentLoaded', () => {
    // Initialize dark mode from localStorage
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
});

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
}

// Navigation functions
function navigateTo(page) {
    window.location.href = page;
}

const API_BASE = window.location.protocol === 'file:' 
    ? "http://127.0.0.1:8000" 
    : window.location.origin;

async function handleUserLogin(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]') || event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Authenticating...';
    btn.disabled = true;
    
    const email = event.target.querySelector('#email').value;
    const password = event.target.querySelector('#password').value;

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password: password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('currentUser', data.username);
            localStorage.setItem('userRole', data.role);
            if (data.role === 'admin') {
                window.location.href = 'admin dashboard.html';
            } else {
                window.location.href = 'user dashboard.html';
            }
        } else {
            alert(data.detail || "Login failed");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    } catch (error) {
        alert("Could not connect to backend. Make sure it's running.");
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function handleAdminLogin(event) {
    handleUserLogin(event);
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    setTimeout(() => {
        window.location.href = 'logout.html';
    }, 300);
}

function handleAdminLogout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    setTimeout(() => {
        window.location.href = 'admin logout.html';
    }, 300);
}

async function handleUserSignup(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]') || event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Creating Account...';
    btn.disabled = true;

    const email = event.target.querySelector('#email').value;
    const password = event.target.querySelector('#password').value;

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password: password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert("Registration successful! Please login.");
            window.location.href = 'signin.html';
        } else {
            alert(data.detail || "Registration failed");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    } catch (error) {
        alert("Could not connect to backend. Make sure it's running.");
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Mock actions for UI simulation
function mockAction(event, defaultText, processingText, completeText) {
    if (event) event.preventDefault();
    let btn = event.target;
    if (event.type === 'submit') {
        btn = event.target.querySelector('button[type="submit"]');
    } else if (event.target.closest) {
        btn = event.target.closest('button');
    }
    if (!btn || btn.disabled) return Promise.resolve();
    const originalContent = btn.innerHTML;
    btn.disabled = true;
    if (btn.querySelector('span')) {
        btn.innerHTML = `<span class="material-symbols-outlined mr-2 animate-spin">sync</span><span>${processingText}</span>`;
    } else {
        btn.innerHTML = processingText;
    }
    return new Promise(resolve => {
        setTimeout(() => {
            if (btn.querySelector('span')) {
                btn.innerHTML = `<span class="material-symbols-outlined mr-2">check_circle</span><span>${completeText}</span>`;
                btn.classList.remove('bg-primary');
                btn.classList.add('bg-green-600');
            } else {
                btn.innerHTML = completeText;
            }
            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.disabled = false;
                btn.classList.add('bg-primary');
                btn.classList.remove('bg-green-600');
            }, 3000);
            resolve();
        }, 1500);
    });
}

// Data submission handlers calling Backend
async function handleDocumentUpload(event) {
    event.preventDefault();
    const username = localStorage.getItem('currentUser');
    if (!username) return alert('Not logged in!');
    
    const fileInput = document.getElementById('fileInput');
    let doc_name = "Untitled";
    if (fileInput && fileInput.files.length > 0) {
        doc_name = fileInput.files[0].name;
    } else {
        // Fallback or alert
        doc_name = "Mock_Document_" + Math.floor(Math.random() * 1000) + ".pdf";
    }

    await mockAction(event, 'Confirm Upload', 'Uploading...', 'Upload Complete');
    
    try {
        await fetch(`${API_BASE}/documents/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, doc_name: doc_name })
        });
        setTimeout(() => { window.location.href = 'user dashboard.html'; }, 1000);
    } catch (e) {
        console.error(e);
    }
}

async function handleCredentialSave(event) {
    event.preventDefault();
    const username = localStorage.getItem('currentUser');
    if (!username) return alert('Not logged in!');
    
    const form = event.target;
    const accName = form.querySelector('input[type="text"]')?.value || "Unknown Account";
    const accUser = form.querySelectorAll('input[type="text"]')[1]?.value || "Unknown User";
    const accPass = form.querySelector('input[type="password"]')?.value || "Unknown Pass";

    await mockAction(event, 'UPLOAD TO SECURE VAULT', 'ENCRYPTING...', 'SAVED TO VAULT');

    try {
        await fetch(`${API_BASE}/credentials/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: username, 
                account_type: accName,
                account_username: accUser,
                account_password: accPass
            })
        });
        setTimeout(() => { window.location.href = 'user dashboard.html'; }, 1000);
    } catch(e) {
        console.error(e);
    }
}

async function handleMedicalSave(event) {
    event.preventDefault();
    const username = localStorage.getItem('currentUser');
    if (!username) return alert('Not logged in!');

    // Get input if available
    const hospital = document.querySelectorAll('input[type="text"]')[0]?.value || "General Hospital";
    const doctor = document.querySelectorAll('input[type="text"]')[1]?.value || "Dr. Unknown";

    await mockAction(event, 'Securely Upload', 'Encrypting & Uploading...', 'Report Secured');
    
    try {
        await fetch(`${API_BASE}/medical/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, report_name: `Report from ${doctor}`, hospital: hospital })
        });
        setTimeout(() => { window.location.href = 'user dashboard.html'; }, 1000);
    } catch(e) {
        console.error(e);
    }
}

async function handleNoteSave(event) {
    event.preventDefault();
    const username = localStorage.getItem('currentUser');
    if (!username) return alert('Not logged in!');

    await mockAction(event, 'SECURE UPLOAD', 'ENCRYPTING...', 'SECURED');
    
    const textarea = document.querySelector('textarea');
    const content = textarea ? textarea.value : "Encrypted Note";
    
    try {
        await fetch(`${API_BASE}/notes/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, title: "Secure Note", content: content })
        });
        setTimeout(() => { window.location.href = 'user dashboard.html'; }, 1000);
    } catch(e) {
        console.error(e);
    }
}

// Dashboard Init
async function initDashboard() {
    const username = localStorage.getItem('currentUser');
    if (!username) {
        window.location.href = 'signin.html';
        return;
    }

    const greetingName = document.getElementById('greeting-name');
    if (greetingName) {
        greetingName.innerText = `Hello ${username.split('@')[0]}`;
    }

    try {
        const response = await fetch(`${API_BASE}/stats/${username}`);
        if (response.ok) {
            const data = await response.json();
            const docsCount = document.getElementById('docs-count');
            const medsCount = document.getElementById('meds-count');
            const credsCount = document.getElementById('creds-count');
            const notesCount = document.getElementById('notes-count');
            
            if(docsCount) docsCount.innerText = `${data.documents} Items`;
            if(medsCount) medsCount.innerText = `${data.medical_reports} Reports`;
            if(credsCount) credsCount.innerText = `${data.credentials} Logins`;
            if(notesCount) notesCount.innerText = `${data.notes} Snippets`;
        }
    } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
    }
}

async function initAdminDashboard() {
    try {
        const response = await fetch(`${API_BASE}/admin/stats`);
        if (response.ok) {
            const data = await response.json();
            const statUsers = document.getElementById('stat-users');
            if(statUsers) statUsers.innerText = data.total_users;
        }
    } catch (error) {
        console.error("Failed to fetch admin stats", error);
    }
}

