Digital Vault
=============

Digital Vault is a small web-based personal records manager for storing and viewing documents, notes, and medical reports. This repository contains the static frontend pages and a minimal Python backend used for authentication and serving data.

Features
--------
- User signup / signin pages
- Simple dashboard views for users and admins
- Pages for documents, notes, and medical reports
- Minimal Python backend for authentication and basic data handling

Repository structure
--------------------
- `backend.py` - Python backend entry point (API/auth logic)
- `app.js` - Frontend JavaScript for client-side behavior
- `requirements.txt` - Python dependencies
- `signup.html`, `signin.html`, `login.html`, `logout.html` - auth pages
- `user dashboard.html`, `admin dashboard.html` - dashboards
- `documents.html`, `notes.html`, `medical reports.html` - content pages
- `credentials.html`, `user profile.html` - user account pages

Quick start
-----------
Prerequisites: Python 3.8+ and pip.

1. Create and activate a virtual environment (recommended):

```
python -m venv .venv
.
```

On Windows (PowerShell):

```
.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```
pip install -r requirements.txt
```

3. Run the backend server:

```
python backend.py
```

4. Open the frontend in your browser by opening `homepage.html` (or `login.html`). The frontend is static HTML/JS and can be opened directly or served via a static server.

Notes & Security
----------------
- This project contains example pages and a minimal backend; do not use it in production without adding proper authentication, encryption (TLS), and secure storage for credentials.
- Remove or secure any hard-coded credentials before sharing or deploying.


