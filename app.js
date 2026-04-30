// app.js - Central logic for DigiRaksha navigation and state management

/* ══════════════════════════════════════════════
   THEME SYSTEM
══════════════════════════════════════════════ */
const THEMES = [
  { id: 'green',   name: 'Emerald',  accent: '#3DDC97', primary: '#0F3D2E' },
  { id: 'navy',    name: 'Navy',     accent: '#60A5FA', primary: '#1E3A8A' },
  { id: 'purple',  name: 'Purple',   accent: '#A78BFA', primary: '#4C1D95' },
  { id: 'amber',   name: 'Amber',    accent: '#F59E0B', primary: '#1E293B' },
  { id: 'crimson', name: 'Crimson',  accent: '#F87171', primary: '#7F1D1D' },
  { id: 'cyan',    name: 'Cyan',     accent: '#22D3EE', primary: '#134E4A' },
  { id: 'indigo',  name: 'Indigo',   accent: '#14B8A6', primary: '#1E1B4B' },
];

function applyTheme(themeId) {
  themeId = 'green'; // locked to emerald
  document.documentElement.setAttribute('data-theme', themeId);
  localStorage.setItem('digiTheme', themeId);
  // update switcher active state if it exists
  document.querySelectorAll('[data-theme-btn]').forEach(btn => {
    btn.classList.toggle('ring-2', btn.dataset.themeBtn === themeId);
    btn.classList.toggle('ring-offset-2', btn.dataset.themeBtn === themeId);
    btn.classList.toggle('ring-white', btn.dataset.themeBtn === themeId);
    btn.classList.toggle('scale-110', btn.dataset.themeBtn === themeId);
  });
}

function injectThemeSwitcher() {
  if (document.getElementById('theme-switcher-widget')) return;

  const widget = document.createElement('div');
  widget.id = 'theme-switcher-widget';
  widget.style.cssText = `
    position: fixed; bottom: 24px; left: 24px; z-index: 9999;
    display: flex; flex-direction: column; align-items: flex-start; gap: 8px;
  `;

  // Toggle button
  const toggle = document.createElement('button');
  toggle.id = 'theme-switcher-toggle';
  toggle.title = 'Switch Theme';
  toggle.style.cssText = `
    width: 44px; height: 44px; border-radius: 12px;
    background: var(--primary); color: white;
    border: none; cursor: pointer; display: flex;
    align-items: center; justify-content: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    transition: all 0.2s; font-size: 20px;
  `;
  toggle.innerHTML = '<span style="font-family:Material Symbols Rounded;font-size:20px;font-variation-settings:\"FILL\" 1,\"wght\" 400,\"GRAD\" 0,\"opsz\" 24">palette</span>';

  // Panel
  const panel = document.createElement('div');
  panel.id = 'theme-switcher-panel';
  panel.style.cssText = `
    background: white; border-radius: 16px;
    padding: 12px; display: none; flex-direction: column; gap: 8px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.15);
    border: 1px solid rgba(0,0,0,0.06);
    min-width: 160px;
  `;

  // Dark mode row
  const darkRow = document.createElement('div');
  darkRow.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding:6px 4px; border-bottom:1px solid rgba(0,0,0,0.06); margin-bottom:4px;';
  darkRow.innerHTML = `
    <span style="font-size:12px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:0.05em">Dark Mode</span>
    <button id="theme-dark-toggle" onclick="toggleDarkMode()" style="
      width:36px; height:20px; border-radius:10px; border:none; cursor:pointer;
      background: var(--accent); position:relative; transition:all 0.2s;
    ">
      <span style="
        position:absolute; top:2px; width:16px; height:16px; border-radius:50%;
        background:white; transition:all 0.2s;
        left: ${document.documentElement.classList.contains('dark') ? '18px' : '2px'};
      "></span>
    </button>
  `;
  panel.appendChild(darkRow);

  // Theme label
  const label = document.createElement('div');
  label.style.cssText = 'font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.06em;padding:0 4px;';
  label.textContent = 'Color Theme';
  panel.appendChild(label);

  // Theme buttons grid
  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid; grid-template-columns:repeat(4,1fr); gap:6px;';

  const currentTheme = localStorage.getItem('digiTheme') || 'green';
  THEMES.forEach(theme => {
    const btn = document.createElement('button');
    btn.dataset.themeBtn = theme.id;
    btn.title = theme.name;
    btn.style.cssText = `
      width: 28px; height: 28px; border-radius: 8px; border: 2px solid transparent;
      cursor: pointer; transition: all 0.2s; position: relative;
      background: linear-gradient(135deg, ${theme.primary}, ${theme.accent});
      ${theme.id === currentTheme ? 'border-color: #fff; box-shadow: 0 0 0 2px ' + theme.accent + '; transform: scale(1.15);' : ''}
    `;
    btn.onclick = () => {
      applyTheme(theme.id);
      // update toggle indicators
      grid.querySelectorAll('button').forEach(b => {
        b.style.borderColor = 'transparent';
        b.style.boxShadow = 'none';
        b.style.transform = 'scale(1)';
      });
      btn.style.borderColor = '#fff';
      btn.style.boxShadow = `0 0 0 2px ${theme.accent}`;
      btn.style.transform = 'scale(1.15)';
    };
    grid.appendChild(btn);
  });
  panel.appendChild(grid);

  // Theme names row
  const namesRow = document.createElement('div');
  namesRow.style.cssText = 'display:flex; flex-wrap:wrap; gap:4px; padding:4px 0 0;';
  THEMES.forEach(theme => {
    const chip = document.createElement('button');
    chip.textContent = theme.name;
    chip.style.cssText = `
      font-size:10px; font-weight:700; padding:3px 8px; border-radius:6px;
      border:none; cursor:pointer; transition:all 0.2s;
      background: linear-gradient(135deg, ${theme.primary}22, ${theme.accent}22);
      color: ${theme.primary};
    `;
    chip.onclick = () => applyTheme(theme.id);
    namesRow.appendChild(chip);
  });
  panel.appendChild(namesRow);

  toggle.onclick = () => {
    const isOpen = panel.style.display === 'flex';
    panel.style.display = isOpen ? 'none' : 'flex';
  };

  widget.appendChild(panel);
  widget.appendChild(toggle);
  document.body.appendChild(widget);
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize dark mode from localStorage
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    // Initialize theme — locked to Emerald Green
    document.documentElement.setAttribute('data-theme', 'green');
    localStorage.setItem('digiTheme', 'green');
    // No theme switcher injected
});

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
    // update the dark toggle thumb position in the switcher
    const thumb = document.querySelector('#theme-dark-toggle span');
    if (thumb) thumb.style.left = isDark ? '18px' : '2px';
    const toggleBtn = document.getElementById('theme-dark-toggle');
    if (toggleBtn) toggleBtn.style.background = isDark ? 'var(--accent)' : '#ccc';
}

// Navigation functions
function navigateTo(page) {
    window.location.href = page;
}

const isLocalPreview =
    ["127.0.0.1", "localhost"].includes(window.location.hostname) &&
    window.location.port !== "8000";

const API_BASE =
    window.location.protocol === 'file:' || isLocalPreview
        ? "http://127.0.0.1:8000"
        : window.location.origin;

const CURRENT_USER_KEY = 'currentUser';
const USER_ROLE_KEY = 'userRole';
const ADMIN_TOKEN_KEY = 'adminSessionToken';
const ADMIN_PAGE_SIZE = 5;

let adminUsers = [];
let adminFilteredUsers = [];
let adminCurrentPage = 1;
let adminDirectoryFilterMode = 'all';
let adminLogs = [];
let selectedDocumentFile = null;
let selectedMedicalFile = null;
let selectedMedicalSource = 'device';
let biometricUnlockEnabled = false;
let noteAutoDestructSetting = 'NEVER';

const PROFILE_STORAGE_PREFIX = 'digirakshaProfile:';
const NOTE_DRAFT_STORAGE_PREFIX = 'digirakshaNoteDraft:';

function clearSession() {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function storeSession(data) {
    localStorage.setItem(CURRENT_USER_KEY, data.username);
    localStorage.setItem(USER_ROLE_KEY, data.role);
    if (data.token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    } else {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
}

function getAdminAuthHeaders() {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function redirectToAdminLogin() {
    window.location.href = 'admin-signin.html';
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getUserInitial(username) {
    return (username || 'U').trim().charAt(0).toUpperCase() || 'U';
}

function buildAdminSecurityKey(user) {
    const suffix = String(user.id).padStart(3, '0');
    return `VLT-${suffix}-AR`;
}

function formatAdminCreatedAt(value) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) {
        return 'Not available';
    }
    return date.toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function downloadTextFile(filename, content, mimeType = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function requireUserSession() {
    const username = localStorage.getItem(CURRENT_USER_KEY);
    if (!username) {
        window.location.href = 'signin.html';
        return null;
    }
    return username;
}

function formatBytes(bytes) {
    if (!bytes) return '0 KB';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function getProfileStorageKey(username) {
    return `${PROFILE_STORAGE_PREFIX}${username}`;
}

function getNoteDraftStorageKey(username) {
    return `${NOTE_DRAFT_STORAGE_PREFIX}${username}`;
}

function insertAroundSelection(textarea, prefix, suffix = prefix) {
    if (!textarea) return;
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const selected = textarea.value.slice(start, end);
    const replacement = `${prefix}${selected}${suffix}`;
    textarea.setRangeText(replacement, start, end, 'end');
    textarea.focus();
    updateNoteCharacterCount();
}

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
            storeSession(data);
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

async function handleAdminLogin(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button[type="submit"]') || event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Authenticating...';
    btn.disabled = true;

    const email = event.target.querySelector('#email').value;
    const password = event.target.querySelector('#password').value;

    try {
        const response = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            storeSession(data);
            window.location.href = 'admin dashboard.html';
        } else {
            alert(data.detail || "Admin login failed");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    } catch (error) {
        alert("Could not connect to backend. Make sure it's running.");
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function handleLogout() {
    clearSession();
    setTimeout(() => {
        window.location.href = 'logout.html';
    }, 300);
}

async function handleAdminLogout() {
    try {
        const headers = getAdminAuthHeaders();
        if (headers.Authorization) {
            await fetch(`${API_BASE}/admin/logout`, {
                method: 'POST',
                headers
            });
        }
    } catch (error) {
        console.warn("Admin logout request failed", error);
    } finally {
        clearSession();
        setTimeout(() => {
            window.location.href = 'admin logout.html';
        }, 300);
    }
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
    const username = requireUserSession();
    if (!username) return;
    if (!selectedDocumentFile) {
        alert('Select a document before uploading.');
        return;
    }

    await mockAction(event, 'Confirm Upload', 'Uploading...', 'Upload Complete');
    
    try {
        await fetch(`${API_BASE}/documents/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, doc_name: selectedDocumentFile.name })
        });
        setTimeout(() => { window.location.href = 'user dashboard.html'; }, 1000);
    } catch (e) {
        console.error(e);
    }
}

async function handleCredentialSave(event) {
    event.preventDefault();
    const username = requireUserSession();
    if (!username) return;
    
    const form = event.target;
    const accName = form.querySelector('#account_name')?.value?.trim();
    const accUser = form.querySelector('#username')?.value?.trim();
    const accPass = form.querySelector('#password')?.value;

    if (!accName || !accUser || !accPass) {
        alert('Fill in the account name, username, and password first.');
        return;
    }

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
    const username = requireUserSession();
    if (!username) return;

    const hospital = document.getElementById('medical-hospital')?.value?.trim();
    const doctor = document.getElementById('medical-doctor')?.value?.trim();
    const reportDate = document.getElementById('medical-date')?.value;

    if (!hospital || !doctor) {
        alert('Add the hospital and doctor details before uploading.');
        return;
    }

    if (!selectedMedicalFile) {
        alert('Choose a medical report from device or scan one before uploading.');
        return;
    }

    await mockAction(event, 'Securely Upload', 'Encrypting & Uploading...', 'Report Secured');
    
    try {
        await fetch(`${API_BASE}/medical/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                report_name: `${selectedMedicalFile.name} (${reportDate || 'Undated'})`,
                hospital: hospital
            })
        });
        setTimeout(() => { window.location.href = 'user dashboard.html'; }, 1000);
    } catch(e) {
        console.error(e);
    }
}

async function handleNoteSave(event) {
    event.preventDefault();
    const username = requireUserSession();
    if (!username) return;

    const textarea = document.getElementById('secure-note-input');
    const content = textarea ? textarea.value.trim() : '';

    if (!content) {
        alert('Write a note before uploading it to the vault.');
        return;
    }

    await mockAction(event, 'SECURE UPLOAD', 'ENCRYPTING...', 'SECURED');
    
    try {
        await fetch(`${API_BASE}/notes/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                title: `Secure Note (${noteAutoDestructSetting})`,
                content: content
            })
        });
        localStorage.removeItem(getNoteDraftStorageKey(username));
        setTimeout(() => { window.location.href = 'user dashboard.html'; }, 1000);
    } catch(e) {
        console.error(e);
    }
}

function updateSelectedDocument(file) {
    selectedDocumentFile = file || null;
    const name = document.getElementById('selected-document-name');
    const size = document.getElementById('selected-document-size');
    const status = document.getElementById('document-upload-status');
    const progress = document.getElementById('document-upload-progress');
    const progressBar = document.getElementById('document-upload-progress-bar');
    const removeButton = document.getElementById('selected-document-remove');

    if (name) name.innerText = selectedDocumentFile ? selectedDocumentFile.name : 'No file selected';
    if (size) size.innerText = selectedDocumentFile ? formatBytes(selectedDocumentFile.size) : 'Choose a file to begin';
    if (status) status.innerText = selectedDocumentFile ? 'Ready to encrypt and upload' : 'Waiting for a file';
    if (progress) progress.innerText = selectedDocumentFile ? '100%' : '0%';
    if (progressBar) progressBar.style.width = selectedDocumentFile ? '100%' : '0%';
    if (removeButton) removeButton.disabled = !selectedDocumentFile;
}

function clearSelectedDocument(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('fileInput');
    if (input) input.value = '';
    updateSelectedDocument(null);
}

function initDocumentsPage() {
    if (!requireUserSession()) return;

    const fileInput = document.getElementById('fileInput');
    if (fileInput && !fileInput.dataset.bound) {
        fileInput.dataset.bound = 'true';
        fileInput.addEventListener('change', () => {
            updateSelectedDocument(fileInput.files?.[0] || null);
        });
    }

    const removeButton = document.getElementById('selected-document-remove');
    if (removeButton && !removeButton.dataset.bound) {
        removeButton.dataset.bound = 'true';
        removeButton.addEventListener('click', clearSelectedDocument);
    }

    updateSelectedDocument(fileInput?.files?.[0] || null);
}

function updateSelectedMedicalFile(file, source = 'device') {
    selectedMedicalFile = file || null;
    selectedMedicalSource = source;

    const name = document.getElementById('selected-medical-name');
    const size = document.getElementById('selected-medical-size');
    const sourceLabel = document.getElementById('selected-medical-source');
    const status = document.getElementById('medical-upload-status');
    const removeButton = document.getElementById('selected-medical-remove');

    if (name) name.innerText = selectedMedicalFile ? selectedMedicalFile.name : 'No scan selected';
    if (size) size.innerText = selectedMedicalFile ? formatBytes(selectedMedicalFile.size) : 'Upload from device or scan with camera';
    if (sourceLabel) sourceLabel.innerText = selectedMedicalFile
        ? (selectedMedicalSource === 'scan' ? 'Captured via camera' : 'Selected from device')
        : 'Awaiting file';
    if (status) status.innerText = selectedMedicalFile ? 'File ready for secure encryption' : 'No file selected yet';
    if (removeButton) removeButton.disabled = !selectedMedicalFile;
}

function clearSelectedMedicalFile(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('medical-file-input');
    const scanInput = document.getElementById('medical-scan-input');
    if (input) input.value = '';
    if (scanInput) scanInput.value = '';
    updateSelectedMedicalFile(null);
}

function initMedicalPage() {
    if (!requireUserSession()) return;

    const fileInput = document.getElementById('medical-file-input');
    const scanInput = document.getElementById('medical-scan-input');
    const uploadButton = document.getElementById('medical-upload-device');
    const scanButton = document.getElementById('medical-scan-camera');
    const removeButton = document.getElementById('selected-medical-remove');
    const dateInput = document.getElementById('medical-date');

    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().slice(0, 10);
    }

    if (uploadButton && !uploadButton.dataset.bound) {
        uploadButton.dataset.bound = 'true';
        uploadButton.addEventListener('click', () => fileInput?.click());
    }

    if (scanButton && !scanButton.dataset.bound) {
        scanButton.dataset.bound = 'true';
        scanButton.addEventListener('click', () => scanInput?.click());
    }

    if (fileInput && !fileInput.dataset.bound) {
        fileInput.dataset.bound = 'true';
        fileInput.addEventListener('change', () => {
            updateSelectedMedicalFile(fileInput.files?.[0] || null, 'device');
        });
    }

    if (scanInput && !scanInput.dataset.bound) {
        scanInput.dataset.bound = 'true';
        scanInput.addEventListener('change', () => {
            updateSelectedMedicalFile(scanInput.files?.[0] || null, 'scan');
        });
    }

    if (removeButton && !removeButton.dataset.bound) {
        removeButton.dataset.bound = 'true';
        removeButton.addEventListener('click', clearSelectedMedicalFile);
    }

    updateSelectedMedicalFile(null);
}

function toggleCredentialPasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const icon = document.getElementById('credential-visibility-icon');
    if (!passwordInput) return;

    const showing = passwordInput.type === 'text';
    passwordInput.type = showing ? 'password' : 'text';
    if (icon) icon.innerText = showing ? 'visibility' : 'visibility_off';
}

function setCredentialMode(mode) {
    const aesCard = document.getElementById('credential-aes-card');
    const biometricCard = document.getElementById('credential-biometric-card');
    const biometricIcon = document.getElementById('credential-biometric-icon');
    const biometricStatus = document.getElementById('credential-biometric-status');

    biometricUnlockEnabled = mode === 'biometric';

    if (aesCard) {
        aesCard.className = biometricUnlockEnabled
            ? 'p-4 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-3 cursor-pointer transition-all'
            : 'p-4 border-2 border-secondary bg-secondary/5 rounded-xl flex items-center gap-3 cursor-pointer transition-all';
    }

    if (biometricCard) {
        biometricCard.className = biometricUnlockEnabled
            ? 'p-4 border-2 border-secondary bg-secondary/5 rounded-xl flex items-center gap-3 cursor-pointer transition-all'
            : 'p-4 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-3 cursor-pointer transition-all';
    }

    if (biometricIcon) {
        biometricIcon.className = biometricUnlockEnabled
            ? 'material-symbols-outlined text-secondary'
            : 'material-symbols-outlined text-slate-400';
    }

    if (biometricStatus) {
        biometricStatus.innerText = biometricUnlockEnabled ? 'Enabled for this credential' : 'FaceID / TouchID';
    }
}

function initCredentialsPage() {
    if (!requireUserSession()) return;

    const visibilityButton = document.getElementById('credential-visibility-toggle');
    const aesCard = document.getElementById('credential-aes-card');
    const biometricCard = document.getElementById('credential-biometric-card');

    if (visibilityButton && !visibilityButton.dataset.bound) {
        visibilityButton.dataset.bound = 'true';
        visibilityButton.addEventListener('click', toggleCredentialPasswordVisibility);
    }

    if (aesCard && !aesCard.dataset.bound) {
        aesCard.dataset.bound = 'true';
        aesCard.addEventListener('click', () => setCredentialMode('aes'));
    }

    if (biometricCard && !biometricCard.dataset.bound) {
        biometricCard.dataset.bound = 'true';
        biometricCard.addEventListener('click', () => setCredentialMode('biometric'));
    }

    setCredentialMode('aes');
}

function updateNoteCharacterCount() {
    const textarea = document.getElementById('secure-note-input');
    const counter = document.getElementById('secure-note-counter');
    if (!textarea || !counter) return;
    counter.innerText = `Characters: ${textarea.value.length} / 10,000`;
}

function setNoteAutoDestruct(value) {
    noteAutoDestructSetting = value;
    document.querySelectorAll('[data-note-autodestruct]').forEach((button) => {
        const active = button.dataset.noteAutodestruct === value;
        button.className = active
            ? 'flex-1 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-primary dark:text-accent border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-bold'
            : 'flex-1 py-2 bg-slate-50 dark:bg-slate-800 text-slate-500 border border-transparent rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors';
    });
}

function saveNoteDraft(event) {
    if (event) event.preventDefault();
    const username = requireUserSession();
    if (!username) return;

    const textarea = document.getElementById('secure-note-input');
    const classification = document.getElementById('note-classification');
    const draft = {
        content: textarea?.value || '',
        classification: classification?.value || 'Internal Use Only',
        autoDestruct: noteAutoDestructSetting
    };
    localStorage.setItem(getNoteDraftStorageKey(username), JSON.stringify(draft));
    alert('Draft saved locally for this user.');
}

function initNotesPage() {
    const username = requireUserSession();
    if (!username) return;

    const textarea = document.getElementById('secure-note-input');
    const classification = document.getElementById('note-classification');
    const draftRaw = localStorage.getItem(getNoteDraftStorageKey(username));

    if (draftRaw) {
        try {
            const draft = JSON.parse(draftRaw);
            if (textarea) textarea.value = draft.content || '';
            if (classification && draft.classification) classification.value = draft.classification;
            setNoteAutoDestruct(draft.autoDestruct || 'NEVER');
        } catch (error) {
            setNoteAutoDestruct('NEVER');
        }
    } else {
        setNoteAutoDestruct('NEVER');
    }

    if (textarea && !textarea.dataset.bound) {
        textarea.dataset.bound = 'true';
        textarea.addEventListener('input', updateNoteCharacterCount);
    }

    document.querySelectorAll('[data-format-action]').forEach((button) => {
        if (button.dataset.bound) return;
        button.dataset.bound = 'true';
        button.addEventListener('click', () => {
            const action = button.dataset.formatAction;
            if (action === 'bold') insertAroundSelection(textarea, '**');
            if (action === 'bullet') insertAroundSelection(textarea, '\n- ', '');
            if (action === 'link') insertAroundSelection(textarea, '[', '](https://)');
        });
    });

    document.querySelectorAll('[data-note-autodestruct]').forEach((button) => {
        if (button.dataset.bound) return;
        button.dataset.bound = 'true';
        button.addEventListener('click', () => setNoteAutoDestruct(button.dataset.noteAutodestruct));
    });

    const draftButton = document.getElementById('note-save-draft');
    if (draftButton && !draftButton.dataset.bound) {
        draftButton.dataset.bound = 'true';
        draftButton.addEventListener('click', saveNoteDraft);
    }

    updateNoteCharacterCount();
}

function initUserProfilePage() {
    const username = requireUserSession();
    if (!username) return;

    const storedProfileRaw = localStorage.getItem(getProfileStorageKey(username));
    let profile = {
        fullName: username.split('@')[0],
        email: username,
        phone: '',
        dob: '',
        address: ''
    };

    if (storedProfileRaw) {
        try {
            profile = { ...profile, ...JSON.parse(storedProfileRaw) };
        } catch (error) {
            console.warn('Invalid stored profile data', error);
        }
    }

    const fields = {
        fullName: document.getElementById('profile-full-name'),
        email: document.getElementById('profile-email'),
        phone: document.getElementById('profile-phone'),
        dob: document.getElementById('profile-dob'),
        address: document.getElementById('profile-address')
    };

    Object.entries(fields).forEach(([key, element]) => {
        if (element) element.value = profile[key] || '';
    });

    const title = document.getElementById('profile-display-name');
    if (title) {
        title.innerText = profile.fullName || username.split('@')[0];
    }
}

function saveUserProfile(event) {
    if (event) event.preventDefault();
    const username = requireUserSession();
    if (!username) return;

    const profile = {
        fullName: document.getElementById('profile-full-name')?.value?.trim() || username.split('@')[0],
        email: document.getElementById('profile-email')?.value?.trim() || username,
        phone: document.getElementById('profile-phone')?.value?.trim() || '',
        dob: document.getElementById('profile-dob')?.value || '',
        address: document.getElementById('profile-address')?.value?.trim() || ''
    };

    localStorage.setItem(getProfileStorageKey(username), JSON.stringify(profile));
    const title = document.getElementById('profile-display-name');
    if (title) title.innerText = profile.fullName;
    alert('Profile changes saved locally.');
}

async function deleteCurrentAccount(event) {
    if (event) event.preventDefault();
    const username = requireUserSession();
    if (!username) return;

    const confirmed = window.confirm('Delete this account and all vault data permanently?');
    if (!confirmed) return;

    try {
        const response = await fetch(`${API_BASE}/account/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        const data = await response.json();
        if (!response.ok) {
            alert(data.detail || 'Could not delete the account.');
            return;
        }

        localStorage.removeItem(getProfileStorageKey(username));
        localStorage.removeItem(getNoteDraftStorageKey(username));
        clearSession();
        alert('Account deleted successfully.');
        window.location.href = 'signup.html';
    } catch (error) {
        alert('Could not connect to the backend to delete the account.');
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

    const profileInitial = document.getElementById('profile-initial');
    if (profileInitial) {
        profileInitial.innerText = getUserInitial(username);
    }

    const viewAllButton = document.getElementById('recent-activity-view-all');
    if (viewAllButton && !viewAllButton.dataset.bound) {
        viewAllButton.dataset.bound = 'true';
        viewAllButton.addEventListener('click', () => navigateTo('documents.html'));
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
    const authenticated = await ensureAdminSession();
    if (!authenticated) return;

    bindAdminDashboardActions();
    await refreshAdminDashboardData();
}

async function ensureAdminSession() {
    const role = localStorage.getItem(USER_ROLE_KEY);
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);

    if (role !== 'admin' || !token) {
        clearSession();
        redirectToAdminLogin();
        return false;
    }

    try {
        const response = await fetch(`${API_BASE}/admin/session`, {
            headers: getAdminAuthHeaders()
        });

        if (!response.ok) {
            clearSession();
            redirectToAdminLogin();
            return false;
        }

        return true;
    } catch (error) {
        alert("Could not verify the admin session. Make sure the backend is running.");
        clearSession();
        redirectToAdminLogin();
        return false;
    }
}

function bindAdminDashboardActions() {
    const bindings = [
        ['admin-support-btn', openAdminSupport],
        ['admin-docs-btn', openAdminDocs],
        ['admin-provision-user-btn', () => navigateTo('signup.html')],
        ['admin-refresh-btn', refreshAdminDashboardData],
        ['admin-filter-btn', cycleAdminDirectoryFilter],
        ['admin-export-btn', exportAdminUsers],
        ['admin-export-logs-btn', exportAdminLogs],
        ['admin-prev-page', () => changeAdminPage(-1)],
        ['admin-next-page', () => changeAdminPage(1)],
        ['admin-page-current', () => goToAdminPage(adminCurrentPage)],
        ['admin-page-next', () => goToAdminPage(adminCurrentPage + 1)],
        ['admin-privacy-link', openAdminDocs],
        ['admin-security-link', openAdminDocs]
    ];

    bindings.forEach(([id, handler]) => {
        const element = document.getElementById(id);
        if (element && !element.dataset.bound) {
            element.dataset.bound = 'true';
            element.addEventListener('click', handler);
        }
    });

    const searchInput = document.getElementById('admin-user-search');
    if (searchInput && !searchInput.dataset.bound) {
        searchInput.dataset.bound = 'true';
        searchInput.addEventListener('input', () => applyAdminDirectoryFilters(true));
    }

    bindAdminNavigation();
}

function bindAdminNavigation() {
    const navItems = document.querySelectorAll('[data-admin-nav]');
    navItems.forEach((item) => {
        if (item.dataset.bound) return;
        item.dataset.bound = 'true';
        item.addEventListener('click', (event) => {
            event.preventDefault();
            scrollAdminSection(item.dataset.adminNav);
        });
    });

    const main = document.getElementById('admin-main-content');
    if (main && !main.dataset.navBound) {
        main.dataset.navBound = 'true';
        main.addEventListener('scroll', updateAdminActiveNavFromScroll, { passive: true });
    }

    updateAdminActiveNavFromScroll();
}

function getAdminNavClasses(active) {
    return active
        ? 'flex items-center gap-3 px-4 py-3 bg-emerald-900 text-white dark:bg-emerald-500 dark:text-slate-950 rounded-sm font-medium font-public-sans text-sm tracking-wide duration-200 ease-in-out'
        : 'flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-emerald-900 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-public-sans text-sm tracking-wide duration-200 ease-in-out';
}

function setActiveAdminNav(sectionId) {
    document.querySelectorAll('[data-admin-nav]').forEach((item) => {
        item.className = getAdminNavClasses(item.dataset.adminNav === sectionId);
    });
}

function scrollAdminSection(sectionId) {
    const main = document.getElementById('admin-main-content');
    const section = document.getElementById(sectionId);
    if (!main || !section) return;

    const targetTop = Math.max(0, section.offsetTop - 24);
    main.scrollTo({
        top: targetTop,
        behavior: 'smooth'
    });
    setActiveAdminNav(sectionId);
}

function updateAdminActiveNavFromScroll() {
    const main = document.getElementById('admin-main-content');
    if (!main) return;

    const sections = ['overview', 'storage-metrics', 'user-management', 'security-logs']
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    const currentPosition = main.scrollTop + 80;
    let activeSection = sections[0]?.id || 'overview';

    sections.forEach((section) => {
        if (section.offsetTop <= currentPosition) {
            activeSection = section.id;
        }
    });

    setActiveAdminNav(activeSection);
}

function openAdminSupport() {
    window.location.href = 'mailto:support@digiraksha.local?subject=DigiRaksha%20Admin%20Support';
}

function openAdminDocs(event) {
    if (event) event.preventDefault();
    navigateTo('README.md');
}

async function refreshAdminDashboardData() {
    await Promise.all([
        loadAdminStats(),
        loadAdminUsers(),
        loadAdminLogs()
    ]);
}

async function loadAdminStats() {
    try {
        const response = await fetch(`${API_BASE}/admin/stats`, {
            headers: getAdminAuthHeaders()
        });
        if (response.ok) {
            const data = await response.json();
            const statUsers = document.getElementById('stat-users');
            const statDocuments = document.getElementById('stat-documents');
            const statCredentials = document.getElementById('stat-credentials');
            const statMedical = document.getElementById('stat-medical');
            const statNotes = document.getElementById('stat-notes');
            const storageUtilization = document.getElementById('storage-utilization');
            const storageBar = document.getElementById('storage-bar');
            if (statUsers) statUsers.innerText = data.total_users;
            if (statDocuments) statDocuments.innerText = data.total_documents;
            if (statCredentials) statCredentials.innerText = data.total_credentials;
            if (statMedical) statMedical.innerText = data.total_medical;
            if (statNotes) statNotes.innerText = data.total_notes;
            if (storageUtilization) storageUtilization.innerText = `${data.storage_utilization}%`;
            if (storageBar) storageBar.style.width = `${data.storage_utilization}%`;
        } else if (response.status === 401) {
            clearSession();
            redirectToAdminLogin();
        }
    } catch (error) {
        console.error("Failed to fetch admin stats", error);
    }
}

async function loadAdminUsers() {
    try {
        const response = await fetch(`${API_BASE}/admin/users`, {
            headers: getAdminAuthHeaders()
        });

        if (response.ok) {
            adminUsers = await response.json();
            applyAdminDirectoryFilters(true);
        } else if (response.status === 401) {
            clearSession();
            redirectToAdminLogin();
        }
    } catch (error) {
        console.error("Failed to fetch admin users", error);
    }
}

async function loadAdminLogs() {
    try {
        const response = await fetch(`${API_BASE}/admin/logs`, {
            headers: getAdminAuthHeaders()
        });
        if (response.ok) {
            adminLogs = await response.json();
            renderAdminLogs();
        } else if (response.status === 401) {
            clearSession();
            redirectToAdminLogin();
        }
    } catch (error) {
        console.error("Failed to fetch admin logs", error);
    }
}

function cycleAdminDirectoryFilter() {
    const order = ['all', 'a-m', 'n-z'];
    const currentIndex = order.indexOf(adminDirectoryFilterMode);
    adminDirectoryFilterMode = order[(currentIndex + 1) % order.length];
    applyAdminDirectoryFilters(true);

    const filterLabel = {
        'all': 'All users',
        'a-m': 'A-M usernames',
        'n-z': 'N-Z usernames'
    };
    const button = document.getElementById('admin-filter-btn');
    if (button) {
        button.title = `Filter: ${filterLabel[adminDirectoryFilterMode]}`;
    }
}

function applyAdminDirectoryFilters(resetPage = false) {
    const searchInput = document.getElementById('admin-user-search');
    const term = (searchInput?.value || '').trim().toLowerCase();

    adminFilteredUsers = adminUsers.filter((user) => {
        const username = (user.username || '').toLowerCase();
        const key = buildAdminSecurityKey(user).toLowerCase();
        const idText = String(user.id);

        const matchesSearch =
            !term ||
            username.includes(term) ||
            key.includes(term) ||
            idText.includes(term);

        if (!matchesSearch) return false;
        if (adminDirectoryFilterMode === 'a-m') {
            return username.charAt(0) < 'n';
        }
        if (adminDirectoryFilterMode === 'n-z') {
            return username.charAt(0) >= 'n';
        }
        return true;
    });

    if (resetPage) {
        adminCurrentPage = 1;
    }

    renderAdminUsers();
}

function renderAdminUsers() {
    const tbody = document.getElementById('admin-users-body');
    const summary = document.getElementById('admin-directory-summary');
    if (!tbody) return;

    const totalPages = Math.max(1, Math.ceil(adminFilteredUsers.length / ADMIN_PAGE_SIZE));
    adminCurrentPage = Math.min(adminCurrentPage, totalPages);
    adminCurrentPage = Math.max(1, adminCurrentPage);

    const startIndex = (adminCurrentPage - 1) * ADMIN_PAGE_SIZE;
    const pageUsers = adminFilteredUsers.slice(startIndex, startIndex + ADMIN_PAGE_SIZE);

    if (pageUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-10 text-center text-on-surface-variant">
                    No users match the current search or filter.
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = pageUsers.map((user) => {
            const safeUsername = escapeHtml(user.username);
            const encodedUsername = encodeURIComponent(user.username);
            const userInitial = getUserInitial(user.username);
            const securityKey = buildAdminSecurityKey(user);
            const displayName = escapeHtml((user.username || '').split('@')[0] || user.username);
            return `
                <tr class="hover:bg-secondary/5 transition-colors group">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-8 bg-secondary scale-y-0 group-hover:scale-y-100 transition-transform origin-top -ml-6 mr-3"></div>
                            <div class="w-8 h-8 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-semibold text-xs">${escapeHtml(userInitial)}</div>
                            <div>
                                <div class="font-semibold text-primary">${displayName}</div>
                                <div class="text-caption text-outline text-[11px] uppercase tracking-tighter">ID: ${escapeHtml(securityKey)}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-on-surface-variant">${safeUsername}</td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-2 font-mono text-sm text-outline">
                            <span class="material-symbols-outlined text-sm text-secondary" data-icon="vpn_key">vpn_key</span>
                            ${escapeHtml(securityKey)}
                        </div>
                    </td>
                    <td class="px-6 py-4 text-on-surface-variant">${escapeHtml(formatAdminCreatedAt(user.created_at))}</td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                        <button type="button" onclick="copyAdminUsername(decodeURIComponent(this.dataset.username))" data-username="${encodedUsername}" class="text-outline hover:text-primary transition-colors" title="Copy username">
                            <span class="material-symbols-outlined" data-icon="content_copy">content_copy</span>
                        </button>
                        <button type="button" onclick="deleteAdminUser(decodeURIComponent(this.dataset.username))" data-username="${encodedUsername}" class="text-outline hover:text-red-600 transition-colors" title="Delete user">
                            <span class="material-symbols-outlined" data-icon="delete">delete</span>
                        </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    if (summary) {
        const start = adminFilteredUsers.length ? startIndex + 1 : 0;
        const end = Math.min(startIndex + ADMIN_PAGE_SIZE, adminFilteredUsers.length);
        summary.innerText = `Showing ${start}-${end} of ${adminFilteredUsers.length} users`;
    }

    updateAdminPagination(totalPages);
}

async function copyAdminUsername(username) {
    try {
        await navigator.clipboard.writeText(username);
        alert(`Copied ${username} to the clipboard.`);
    } catch (error) {
        alert(`User: ${username}`);
    }
}

async function deleteAdminUser(username) {
    const confirmed = window.confirm(`Delete ${username} and all associated vault data?`);
    if (!confirmed) return;

    try {
        const response = await fetch(`${API_BASE}/admin/users/${encodeURIComponent(username)}`, {
            method: 'DELETE',
            headers: getAdminAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) {
            alert(data.detail || 'Could not delete the user.');
            return;
        }
        alert(data.message || 'User deleted successfully.');
        await refreshAdminDashboardData();
    } catch (error) {
        alert('Could not connect to the backend to delete the user.');
    }
}

function renderAdminLogs() {
    const logList = document.getElementById('admin-log-list');
    if (!logList) return;

    if (!adminLogs.length) {
        logList.innerHTML = '<div class="px-6 py-5 text-on-surface-variant">No audit events recorded yet.</div>';
        return;
    }

    logList.innerHTML = adminLogs.map((entry) => {
        const badgeClass = entry.status === 'success'
            ? 'bg-emerald-100 text-emerald-900'
            : 'bg-red-100 text-red-900';
        return `
            <div class="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <div class="font-semibold text-primary">${escapeHtml(entry.action.replace(/_/g, ' '))}</div>
                    <div class="text-sm text-on-surface-variant">Actor: ${escapeHtml(entry.actor)} | Target: ${escapeHtml(entry.target)}</div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-sm text-outline">${escapeHtml(entry.timestamp)}</span>
                    <span class="px-2 py-1 text-xs font-bold uppercase rounded ${badgeClass}">${escapeHtml(entry.status)}</span>
                </div>
            </div>
        `;
    }).join('');
}

function updateAdminPagination(totalPages) {
    const prevButton = document.getElementById('admin-prev-page');
    const currentButton = document.getElementById('admin-page-current');
    const nextPageButton = document.getElementById('admin-page-next');
    const nextButton = document.getElementById('admin-next-page');

    if (prevButton) prevButton.disabled = adminCurrentPage <= 1;
    if (nextButton) nextButton.disabled = adminCurrentPage >= totalPages;
    if (currentButton) currentButton.innerText = String(adminCurrentPage);

    if (nextPageButton) {
        if (adminCurrentPage < totalPages) {
            nextPageButton.innerText = String(adminCurrentPage + 1);
            nextPageButton.disabled = false;
            nextPageButton.classList.remove('hidden');
        } else {
            nextPageButton.disabled = true;
            nextPageButton.classList.add('hidden');
        }
    }
}

function changeAdminPage(offset) {
    const totalPages = Math.max(1, Math.ceil(adminFilteredUsers.length / ADMIN_PAGE_SIZE));
    goToAdminPage(Math.min(totalPages, Math.max(1, adminCurrentPage + offset)));
}

function goToAdminPage(page) {
    const totalPages = Math.max(1, Math.ceil(adminFilteredUsers.length / ADMIN_PAGE_SIZE));
    if (page < 1 || page > totalPages) return;
    adminCurrentPage = page;
    renderAdminUsers();
}

function exportAdminUsers() {
    const rows = adminFilteredUsers.map((user) => {
        return [
            user.id,
            `"${String(user.username).replace(/"/g, '""')}"`,
            `"${String(buildAdminSecurityKey(user)).replace(/"/g, '""')}"`,
            `"${String(formatAdminCreatedAt(user.created_at)).replace(/"/g, '""')}"`
        ].join(',');
    });

    const csv = [
        'id,username,security_key,created_at',
        ...rows
    ].join('\n');

    downloadTextFile('admin-users.csv', csv, 'text/csv;charset=utf-8');
}

function exportAdminLogs() {
    const rows = adminLogs.map((entry) => {
        return [
            `"${String(entry.timestamp).replace(/"/g, '""')}"`,
            `"${String(entry.action).replace(/"/g, '""')}"`,
            `"${String(entry.actor).replace(/"/g, '""')}"`,
            `"${String(entry.target).replace(/"/g, '""')}"`,
            `"${String(entry.status).replace(/"/g, '""')}"`
        ].join(',');
    });

    const csv = [
        'timestamp,action,actor,target,status',
        ...rows
    ].join('\n');

    downloadTextFile('admin-audit-logs.csv', csv, 'text/csv;charset=utf-8');
}

