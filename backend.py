from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import psycopg2
import psycopg2.extras
from typing import List, Optional
import os

app = FastAPI(title="DigiRaksha Backend")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
from sqlalchemy import create_engine

# 1. Get the URL from Render Environment Variables
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # 2. Render/PostgreSQL Fix: SQLAlchemy requires 'postgresql://'
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
else:
    # 3. Local Fallback (Your MySQL)
    DATABASE_URL = "mysql+mysqlconnector://root:12345@localhost:3306/digiraksha3"

engine = create_engine(DATABASE_URL)
def get_db():
    if not DATABASE_URL:
        # Fallback for local testing if needed
        print("DATABASE_URL not set!")
        return None
    try:
        db = psycopg2.connect(DATABASE_URL)
        return db
    except psycopg2.Error as err:
        print(f"Database Error: {err}")
        return None

def init_db():
    db = get_db()
    if db is None:
        return
    cur = db.cursor()
    cur.execute("""CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE,
                password VARCHAR(100))""")
    cur.execute("""CREATE TABLE IF NOT EXISTS documents (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50),
                platform VARCHAR(100),
                doc_name VARCHAR(200),
                file_path VARCHAR(500))""")
    cur.execute("""CREATE TABLE IF NOT EXISTS credentials (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50),
                account_type VARCHAR(100),
                account_username VARCHAR(200),
                account_password VARCHAR(200))""")
    cur.execute("""CREATE TABLE IF NOT EXISTS medical_reports (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50),
                report_name VARCHAR(200),
                hospital VARCHAR(200),
                file_path VARCHAR(500))""")
    cur.execute("""CREATE TABLE IF NOT EXISTS notes (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50),
                title VARCHAR(200),
                content TEXT)""")
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

# Endpoints
@app.post("/register")
def register(user: UserRegister):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cur = db.cursor()
    try:
        cur.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (user.username, user.password))
        db.commit()
        return {"message": "Registration successful"}
    except psycopg2.IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Username already exists")
    finally:
        db.close()

@app.post("/login")
def login(user: UserLogin):
    if user.username == "admin" and user.password == "admin123":
        return {"message": "Admin Login", "role": "admin", "username": "admin"}
    
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cur = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM users WHERE username=%s AND password=%s", (user.username, user.password))
    rec = cur.fetchone()
    db.close()
    
    if rec:
        return {"message": "Login successful", "role": "user", "username": user.username}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/stats/{username}")
def get_stats(username: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cur = db.cursor()
    
    cur.execute("SELECT COUNT(*) FROM documents WHERE username=%s", (username,))
    docs = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM credentials WHERE username=%s", (username,))
    creds = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM medical_reports WHERE username=%s", (username,))
    meds = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM notes WHERE username=%s", (username,))
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
    cur.execute("INSERT INTO documents (username, platform, doc_name, file_path) VALUES (%s, %s, %s, %s)",
                (doc.username, doc.platform, doc.doc_name, doc.file_path))
    db.commit()
    db.close()
    return {"message": "Document added successfully"}

@app.post("/credentials/add")
def add_credential(cred: CredentialCreate):
    db = get_db()
    cur = db.cursor()
    cur.execute("INSERT INTO credentials (username, account_type, account_username, account_password) VALUES (%s, %s, %s, %s)",
                (cred.username, cred.account_type, cred.account_username, cred.account_password))
    db.commit()
    db.close()
    return {"message": "Credential added successfully"}

@app.post("/medical/add")
def add_medical(med: MedicalCreate):
    db = get_db()
    cur = db.cursor()
    cur.execute("INSERT INTO medical_reports (username, report_name, hospital, file_path) VALUES (%s, %s, %s, %s)",
                (med.username, med.report_name, med.hospital, med.file_path))
    db.commit()
    db.close()
    return {"message": "Medical report added successfully"}

@app.post("/notes/add")
def add_note(note: NoteCreate):
    db = get_db()
    cur = db.cursor()
    cur.execute("INSERT INTO notes (username, title, content) VALUES (%s, %s, %s)",
                (note.username, note.title, note.content))
    db.commit()
    db.close()
    return {"message": "Note added successfully"}

@app.get("/admin/stats")
def get_admin_stats():
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
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
def get_admin_users():
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cur = db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT id, username FROM users")
    users = cur.fetchall()
    db.close()
    return users

# Serve the static HTML files directly from the root
@app.get("/")
def read_root():
    return FileResponse('homepage.html')

app.mount("/", StaticFiles(directory=".", html=True), name="static")
