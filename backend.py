from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import sqlite3
from typing import Optional
import os
import hashlib
import secrets
import time

app = FastAPI(title="DigiRaksha Backend")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "digiraksha.db")
ADMIN_SESSION_TTL_SECONDS = int(os.getenv("DIGIRAKSHA_ADMIN_SESSION_TTL", "3600"))


def hash_secret(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


ADMIN_USERNAME = os.getenv("DIGIRAKSHA_ADMIN_USERNAME", "admin")
ADMIN_PASSWORD_HASH = os.getenv(
    "DIGIRAKSHA_ADMIN_PASSWORD_HASH",
    hash_secret(os.getenv("DIGIRAKSHA_ADMIN_PASSWORD", "admin123")),
)
admin_sessions = {}
admin_audit_logs = []


def append_admin_audit(action: str, actor: str, target: Optional[str] = None, status: str = "success"):
    admin_audit_logs.insert(0, {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "action": action,
        "actor": actor,
        "target": target or "-",
        "status": status,
    })
    del admin_audit_logs[50:]

def get_db():
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    return db

def init_db():
    db = get_db()
    cur = db.cursor()
    cur.execute("""CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP)""")
    cur.execute("""CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                platform TEXT,
                doc_name TEXT,
                file_path TEXT)""")
    cur.execute("""CREATE TABLE IF NOT EXISTS credentials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                account_type TEXT,
                account_username TEXT,
                account_password TEXT)""")
    cur.execute("""CREATE TABLE IF NOT EXISTS medical_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                report_name TEXT,
                hospital TEXT,
                file_path TEXT)""")
    cur.execute("""CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                title TEXT,
                content TEXT)""")

    user_columns = [row["name"] for row in cur.execute("PRAGMA table_info(users)").fetchall()]
    if "created_at" not in user_columns:
        cur.execute("ALTER TABLE users ADD COLUMN created_at TEXT")
        cur.execute(
            "UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL"
        )
    db.commit()
    db.close()

# Initialize DB on startup
init_db()

# Models
class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class DocumentCreate(BaseModel):
    username: str
    platform: str = "Frontend"
    doc_name: str
    file_path: str = "Simulated Upload"

class CredentialCreate(BaseModel):
    username: str
    account_type: str
    account_username: str
    account_password: str

class MedicalCreate(BaseModel):
    username: str
    report_name: str
    hospital: str = "General"
    file_path: str = "Simulated Upload"

class NoteCreate(BaseModel):
    username: str
    title: str
    content: str


class AccountDelete(BaseModel):
    username: str


def cleanup_expired_admin_sessions():
    now = time.time()
    expired_tokens = [
        token for token, session in admin_sessions.items()
        if session["expires_at"] <= now
    ]
    for token in expired_tokens:
        admin_sessions.pop(token, None)


def create_admin_session(username: str) -> str:
    cleanup_expired_admin_sessions()
    token = secrets.token_urlsafe(32)
    admin_sessions[token] = {
        "username": username,
        "expires_at": time.time() + ADMIN_SESSION_TTL_SECONDS,
    }
    return token


def extract_bearer_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None
    return token.strip()


def require_admin_session(authorization: Optional[str] = Header(default=None)):
    cleanup_expired_admin_sessions()
    token = extract_bearer_token(authorization)
    session = admin_sessions.get(token or "")
    if not session:
        raise HTTPException(status_code=401, detail="Admin authentication required")
    return session

# Endpoints
@app.post("/register")
def register(user: UserRegister):
    username = user.username.strip()
    if username == ADMIN_USERNAME:
        raise HTTPException(status_code=400, detail="This username is reserved")

    db = get_db()
    cur = db.cursor()
    try:
        cur.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, user.password))
        db.commit()
        return {"message": "Registration successful"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Username already exists")
    finally:
        db.close()

@app.post("/login")
def login(user: UserLogin):
    username = user.username.strip()
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM users WHERE username=? AND password=?", (username, user.password))
    rec = cur.fetchone()
    db.close()
    
    if rec:
        return {"message": "Login successful", "role": "user", "username": username}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@app.post("/admin/login")
def admin_login(user: UserLogin):
    username = user.username.strip()
    if username != ADMIN_USERNAME or hash_secret(user.password) != ADMIN_PASSWORD_HASH:
        append_admin_audit("admin_login", username or "unknown", status="failed")
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    token = create_admin_session(username)
    append_admin_audit("admin_login", username)
    return {
        "message": "Admin login successful",
        "role": "admin",
        "username": username,
        "token": token,
    }


@app.get("/admin/session")
def get_admin_session(session=Depends(require_admin_session)):
    return {
        "authenticated": True,
        "username": session["username"],
        "expires_in": max(0, int(session["expires_at"] - time.time())),
    }


@app.post("/admin/logout")
def admin_logout(authorization: Optional[str] = Header(default=None)):
    token = extract_bearer_token(authorization)
    session = admin_sessions.get(token or "")
    if token:
        admin_sessions.pop(token, None)
    if session:
        append_admin_audit("admin_logout", session["username"])
    return {"message": "Admin session ended"}

@app.get("/stats/{username}")
def get_stats(username: str):
    db = get_db()
    cur = db.cursor()
    
    cur.execute("SELECT COUNT(*) FROM documents WHERE username=?", (username,))
    docs = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM credentials WHERE username=?", (username,))
    creds = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM medical_reports WHERE username=?", (username,))
    meds = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM notes WHERE username=?", (username,))
    notes = cur.fetchone()[0]
    
    db.close()
    return {
        "documents": docs,
        "credentials": creds,
        "medical_reports": meds,
        "notes": notes
    }

@app.post("/documents/add")
def add_document(doc: DocumentCreate):
    db = get_db()
    cur = db.cursor()
    cur.execute("INSERT INTO documents (username, platform, doc_name, file_path) VALUES (?, ?, ?, ?)",
                (doc.username, doc.platform, doc.doc_name, doc.file_path))
    db.commit()
    db.close()
    return {"message": "Document added successfully"}

@app.post("/credentials/add")
def add_credential(cred: CredentialCreate):
    db = get_db()
    cur = db.cursor()
    cur.execute("INSERT INTO credentials (username, account_type, account_username, account_password) VALUES (?, ?, ?, ?)",
                (cred.username, cred.account_type, cred.account_username, cred.account_password))
    db.commit()
    db.close()
    return {"message": "Credential added successfully"}

@app.post("/medical/add")
def add_medical(med: MedicalCreate):
    db = get_db()
    cur = db.cursor()
    cur.execute("INSERT INTO medical_reports (username, report_name, hospital, file_path) VALUES (?, ?, ?, ?)",
                (med.username, med.report_name, med.hospital, med.file_path))
    db.commit()
    db.close()
    return {"message": "Medical report added successfully"}

@app.post("/notes/add")
def add_note(note: NoteCreate):
    db = get_db()
    cur = db.cursor()
    cur.execute("INSERT INTO notes (username, title, content) VALUES (?, ?, ?)",
                (note.username, note.title, note.content))
    db.commit()
    db.close()
    return {"message": "Note added successfully"}


@app.post("/account/delete")
def delete_account(account: AccountDelete):
    db = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM documents WHERE username=?", (account.username,))
    cur.execute("DELETE FROM credentials WHERE username=?", (account.username,))
    cur.execute("DELETE FROM medical_reports WHERE username=?", (account.username,))
    cur.execute("DELETE FROM notes WHERE username=?", (account.username,))
    cur.execute("DELETE FROM users WHERE username=?", (account.username,))
    deleted = cur.rowcount
    db.commit()
    db.close()

    if deleted == 0:
        raise HTTPException(status_code=404, detail="Account not found")

    return {"message": "Account deleted successfully"}

@app.get("/admin/stats")
def get_admin_stats(session=Depends(require_admin_session)):
    db = get_db()
    cur = db.cursor()
    
    cur.execute("SELECT COUNT(*) FROM users")
    users = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM documents")
    docs = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM credentials")
    creds = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM medical_reports")
    meds = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM notes")
    notes = cur.fetchone()[0]
    
    db.close()
    
    return {
        "total_users": users,
        "total_documents": docs,
        "total_credentials": creds,
        "total_medical": meds,
        "total_notes": notes,
        "storage_utilization": min(100, (docs + meds) * 2) # Simulated percentage
    }

@app.get("/admin/users")
def get_admin_users(session=Depends(require_admin_session)):
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT id, username, COALESCE(created_at, CURRENT_TIMESTAMP) AS created_at "
        "FROM users ORDER BY id DESC"
    )
    users = [dict(row) for row in cur.fetchall()]
    db.close()
    return users


@app.delete("/admin/users/{username}")
def admin_delete_user(username: str, session=Depends(require_admin_session)):
    if username == ADMIN_USERNAME:
        raise HTTPException(status_code=400, detail="The admin account cannot be deleted")

    db = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM documents WHERE username=?", (username,))
    cur.execute("DELETE FROM credentials WHERE username=?", (username,))
    cur.execute("DELETE FROM medical_reports WHERE username=?", (username,))
    cur.execute("DELETE FROM notes WHERE username=?", (username,))
    cur.execute("DELETE FROM users WHERE username=?", (username,))
    deleted = cur.rowcount
    db.commit()
    db.close()

    if deleted == 0:
        append_admin_audit("delete_user", session["username"], username, status="failed")
        raise HTTPException(status_code=404, detail="User not found")

    append_admin_audit("delete_user", session["username"], username)
    return {"message": "User deleted successfully"}


@app.get("/admin/logs")
def get_admin_logs(session=Depends(require_admin_session)):
    return admin_audit_logs

# Serve the static HTML files directly from the root
@app.get("/")
def read_root():
    return FileResponse('homepage.html')

app.mount("/", StaticFiles(directory=".", html=True), name="static")


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("DIGIRAKSHA_HOST", "127.0.0.1")
    port = int(os.getenv("DIGIRAKSHA_PORT", "8000"))
    uvicorn.run("backend:app", host=host, port=port)
