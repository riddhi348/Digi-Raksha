import tkinter as t
from tkinter import messagebox, filedialog
from tkinter import ttk
import mysql.connector
import os
import subprocess
import sys

# ---------------- CONFIG ----------------
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "12345",  # <<< CHANGE THIS
    "database": "DIGIRAKSHA1"
}

# ---------------- DATABASE HELPERS ----------------
def get_db():
    return mysql.connector.connect(**DB_CONFIG)

def init_db():
    try:
        db = get_db()
        cur = db.cursor()
        cur.execute("""CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50),
                    password VARCHAR(100))""")
        cur.execute("""CREATE TABLE IF NOT EXISTS documents (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50),
                    platform VARCHAR(100),
                    doc_name VARCHAR(200),
                    file_path VARCHAR(500))""")
        cur.execute("""CREATE TABLE IF NOT EXISTS credentials (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50),
                    account_type VARCHAR(100),
                    account_username VARCHAR(200),
                    account_password VARCHAR(200))""")
        cur.execute("""CREATE TABLE IF NOT EXISTS medical_reports (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50),
                    report_name VARCHAR(200),
                    hospital VARCHAR(200),
                    file_path VARCHAR(500))""")
        cur.execute("""CREATE TABLE IF NOT EXISTS notes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50),
                    title VARCHAR(200),
                    content TEXT)""")
        db.commit()
        print("Tables created successfully or already exist!")
    except mysql.connector.Error as err:
        print("Error Creating tables:", err)
    finally:
        db.close()

# ---------------- AUTH ----------------
def register_user():
    username = reg_user.get().strip()
    password = reg_pass.get().strip()
    if not username or not password:
        messagebox.showerror("Error", "All fields required")
        return
    db = get_db()
    cur = db.cursor()
    try:
        cur.execute("INSERT INTO users (username,password) VALUES (%s,%s)", (username, password))
        db.commit()
        messagebox.showinfo("Success", "Registration successful! Please login.")
        loginPage()
    except mysql.connector.IntegrityError:
        messagebox.showerror("Error", "Username already exists")
    finally:
        db.close()

def login_user():
    username = log_user.get().strip()
    password = log_pass.get().strip()
    if not username or not password:
        messagebox.showerror("Error", "All fields required")
        return

    # --- Admin special case ---
    if username == "admin" and password == "admin123":
        admin_dashboard()
        return

    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM users WHERE username=%s AND password=%s", (username, password))
    rec = cur.fetchone()
    db.close()
    if rec:
        dashboard(username)
    else:
        messagebox.showerror("Error", "Invalid credentials")

#-------------ADMIN LOGIN--------------
def admin_login():
    username = log_user.get().strip()
    password = log_pass.get().strip()
    if not username or not password:
        messagebox.showerror("Error", "All fields required")
        return

    # --- Admin special case ---
    if username == "admin" and password == "admin123":
        admin_dashboard()
    else:
        messagebox.showerror("Error", "Invalid Admin credentials")
       

# ---------------- DOCUMENTS ----------------
def upload_doc(username):
    platform = eplatform.get().strip()
    doc_name = edocname.get().strip()
    file_path = filedialog.askopenfilename(title="Select Document",
                                           filetypes=[("All Files", "."), ("PDF", ".pdf"), ("Images", ".png;.jpg;.jpeg")])
    if not platform or not doc_name or not file_path:
        messagebox.showerror("Error", "All fields required (choose a file too)")
        return
    db = get_db()
    cur = db.cursor()
    cur.execute("INSERT INTO documents (username,platform,doc_name,file_path) VALUES (%s,%s,%s,%s)",
                (username, platform, doc_name, file_path))
    db.commit()
    db.close()
    messagebox.showinfo("Success", f"{doc_name} uploaded successfully!")

def view_docs(username):
    win = t.Toplevel(root)
    win.title("Your Documents")
    win.geometry("800x400")

    tree = ttk.Treeview(win, columns=("ID","Platform","DocName","Path"), show="headings")
    tree.heading("ID", text="ID")
    tree.heading("Platform", text="Platform")
    tree.heading("DocName", text="Document Name")
    tree.heading("Path", text="File Path")
    tree.column("ID", width=40)
    tree.pack(fill="both", expand=True)

    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, platform, doc_name, file_path FROM documents WHERE username=%s", (username,))
    for row in cur.fetchall():
        tree.insert("", "end", values=row)
    db.close()

    def open_file(event):
        sel = tree.focus()
        if sel:
            vals = tree.item(sel, "values")
            path = vals[3]
            if os.path.exists(path):
                try:
                    if sys.platform.startswith("win"):
                        os.startfile(path)
                    elif sys.platform == "darwin":
                        subprocess.call(("open", path))
                    else:
                        subprocess.call(("xdg-open", path))
                except Exception as e:
                    messagebox.showerror("Error", f"Could not open file: {e}")
            else:
                messagebox.showerror("Error", "File not found on disk")

    tree.bind("<Double-1>", open_file)

# ---------------- CREDENTIALS ----------------
def add_credential(username):
    win = t.Toplevel(root)
    win.title("Add Credential")
    win.geometry("400x300")

    atype = t.StringVar()
    auser = t.StringVar()
    apass = t.StringVar()

    t.Label(win, text="Account Type").pack()
    t.Entry(win, textvariable=atype).pack(fill="x", padx=10, pady=5)
    t.Label(win, text="Account Username").pack()
    t.Entry(win, textvariable=auser).pack(fill="x", padx=10, pady=5)
    t.Label(win, text="Account Password").pack()
    t.Entry(win, textvariable=apass, show="*").pack(fill="x", padx=10, pady=5)

    def save():
        if not atype.get().strip() or not auser.get().strip():
            messagebox.showerror("Error", "Type and username required")
            return
        db = get_db()
        cur = db.cursor()
        cur.execute("INSERT INTO credentials (username,account_type,account_username,account_password) VALUES (%s,%s,%s,%s)",
                    (username, atype.get().strip(), auser.get().strip(), apass.get().strip()))
        db.commit()
        db.close()
        messagebox.showinfo("Success", "Credential saved")
        win.destroy()

    t.Button(win, text="Save", command=save).pack(pady=10)

def view_credentials(username):
    win = t.Toplevel(root)
    win.title("Your Credentials")
    win.geometry("700x400")

    tree = ttk.Treeview(win, columns=("ID","Type","Username","Password"), show="headings")
    tree.heading("ID", text="ID")
    tree.heading("Type", text="Account Type")
    tree.heading("Username", text="Account Username")
    tree.heading("Password", text="Account Password")
    tree.column("ID", width=40)
    tree.pack(fill="both", expand=True)

    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, account_type, account_username, account_password FROM credentials WHERE username=%s", (username,))
    for row in cur.fetchall():
        tree.insert("", "end", values=row)
    db.close()

# ---------------- MEDICAL ----------------
def add_medical(username):
    win = t.Toplevel(root)
    win.title("Add Medical Report")
    win.geometry("450x300")

    rname = t.StringVar()
    hosp = t.StringVar()
    fpath = t.StringVar()

    t.Label(win, text="Report Name").pack()
    t.Entry(win, textvariable=rname).pack(fill="x", padx=10, pady=5)
    t.Label(win, text="Hospital/Clinic").pack()
    t.Entry(win, textvariable=hosp).pack(fill="x", padx=10, pady=5)

    def choose_file():
        p = filedialog.askopenfilename(title="Select Report File", filetypes=[("PDF", ".pdf"), ("All", ".")])
        if p:
            fpath.set(p)

    t.Button(win, text="Choose File", command=choose_file).pack(pady=5)
    t.Entry(win, textvariable=fpath).pack(fill="x", padx=10, pady=5)

    def save():
        if not rname.get().strip() or not fpath.get().strip():
            messagebox.showerror("Error", "Report name and file required")
            return
        db = get_db()
        cur = db.cursor()
        cur.execute("INSERT INTO medical_reports (username,report_name,hospital,file_path) VALUES (%s,%s,%s,%s)",
                    (username, rname.get().strip(), hosp.get().strip(), fpath.get().strip()))
        db.commit()
        db.close()
        messagebox.showinfo("Success", "Medical report saved")
        win.destroy()

    t.Button(win, text="Save", command=save).pack(pady=10)

def view_medical(username):
    win = t.Toplevel(root)
    win.title("Medical Reports")
    win.geometry("800x400")

    tree = ttk.Treeview(win, columns=("ID","Report","Hospital","Path"), show="headings")
    tree.heading("ID", text="ID")
    tree.heading("Report", text="Report Name")
    tree.heading("Hospital", text="Hospital")
    tree.heading("Path", text="File Path")
    tree.column("ID", width=40)
    tree.pack(fill="both", expand=True)

    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, report_name, hospital, file_path FROM medical_reports WHERE username=%s", (username,))
    for row in cur.fetchall():
        tree.insert("", "end", values=row)
    db.close()

    def open_file(event):
        sel = tree.focus()
        if sel:
            vals = tree.item(sel, "values")
            path = vals[3]
            if os.path.exists(path):
                try:
                    if sys.platform.startswith("win"):
                        os.startfile(path)
                    elif sys.platform == "darwin":
                        subprocess.call(("open", path))
                    else:
                        subprocess.call(("xdg-open", path))
                except Exception as e:
                    messagebox.showerror("Error", f"Could not open file: {e}")
            else:
                messagebox.showerror("Error", "File not found on disk")

    tree.bind("<Double-1>", open_file)

# ---------------- NOTES ----------------
def add_note(username):
    win = t.Toplevel(root)
    win.title("Add Note")
    win.geometry("500x400")

    title = t.StringVar()
    t.Label(win, text="Title").pack()
    t.Entry(win, textvariable=title).pack(fill="x", padx=10, pady=5)
    t.Label(win, text="Content").pack()
    text_area = t.Text(win, height=10)
    text_area.pack(fill="both", expand=True, padx=10, pady=5)

    def save():
        tcontent = text_area.get("1.0", "end").strip()
        if not title.get().strip() or not tcontent:
            messagebox.showerror("Error", "Title and content required")
            return
        db = get_db()
        cur = db.cursor()
        cur.execute("INSERT INTO notes (username,title,content) VALUES (%s,%s,%s)",
                    (username, title.get().strip(), tcontent))
        db.commit()
        db.close()
        messagebox.showinfo("Success", "Note saved")
        win.destroy()

    t.Button(win, text="Save", command=save).pack(pady=8)

def view_notes(username):
    win = t.Toplevel(root)
    win.title("Notes")
    win.geometry("700x400")

    tree = ttk.Treeview(win, columns=("ID","Title","Content"), show="headings")
    tree.heading("ID", text="ID")
    tree.heading("Title", text="Title")
    tree.heading("Content", text="Content")
    tree.column("ID", width=40)
    tree.pack(fill="both", expand=True)

    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, title, content FROM notes WHERE username=%s", (username,))
    for row in cur.fetchall():
        tree.insert("", "end", values=row)
    db.close()

# ---------------- DASHBOARD ----------------
def dashboard(username):
    clearWindow()
    root.title(f"DigiRaksha - {username}'s Dashboard")
    t.Label(root, text=f"Welcome {username}", font=("Arial Black", 16)).pack(pady=10)
    ttk.Separator(root, orient="horizontal").pack(fill="x", pady=6)

    t.Label(root, text="Platform/App").pack()
    t.Entry(root, textvariable=eplatform).pack()
    t.Label(root, text="Document Name").pack()
    t.Entry(root, textvariable=edocname).pack()
    t.Button(root, text="Upload Document", command=lambda: upload_doc(username)).pack(pady=3)
    t.Button(root, text="View Documents", command=lambda: view_docs(username)).pack(pady=3)
    ttk.Separator(root, orient="horizontal").pack(fill="x", pady=6)

    t.Button(root, text="Add Credential", command=lambda: add_credential(username)).pack(pady=2)
    t.Button(root, text="View Credentials", command=lambda: view_credentials(username)).pack(pady=2)
    ttk.Separator(root, orient="horizontal").pack(fill="x", pady=6)

    t.Button(root, text="Add Medical Report", command=lambda: add_medical(username)).pack(pady=2)
    t.Button(root, text="View Medical Reports", command=lambda: view_medical(username)).pack(pady=2)
    ttk.Separator(root, orient="horizontal").pack(fill="x", pady=6)

    t.Button(root, text="Add Note", command=lambda: add_note(username)).pack(pady=2)
    t.Button(root, text="View Notes", command=lambda: view_notes(username)).pack(pady=2)

# ---------------- ADMIN DASHBOARD ----------------
def admin_dashboard():
    clearWindow()
    root.title("DigiRaksha - Admin Dashboard")
    t.Label(root, text="Welcome Admin", font=("Arial Black", 16)).pack(pady=10)
    ttk.Separator(root, orient="horizontal").pack(fill="x", pady=6)

    # View Users
    def view_users():
        win = t.Toplevel(root)
        win.title("All Users")
        win.geometry("600x400")
        tree = ttk.Treeview(win, columns=("Username", "Password"), show="headings")
        tree.heading("Username", text="Username")
        tree.heading("Password", text="Password")
        tree.pack(fill="both", expand=True)

        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT username, password FROM users")
        for row in cur.fetchall():
            tree.insert("", "end", values=row)
        db.close()

        def delete_user():
            sel = tree.focus()
            if sel:
                vals = tree.item(sel, "values")
                uname = vals[0]
                confirm = messagebox.askyesno("Confirm", f"Delete user {uname}?")
                if confirm:
                    db = get_db()
                    cur = db.cursor()
                    cur.execute("DELETE FROM users WHERE username=%s", (uname,))
                    cur.execute("DELETE FROM documents WHERE username=%s", (uname,))
                    cur.execute("DELETE FROM credentials WHERE username=%s", (uname,))
                    cur.execute("DELETE FROM medical_reports WHERE username=%s", (uname,))
                    cur.execute("DELETE FROM notes WHERE username=%s", (uname,))
                    db.commit()
                    db.close()
                    messagebox.showinfo("Deleted", f"User {uname} deleted")
                    tree.delete(sel)

        t.Button(win, text="Delete Selected User", command=delete_user).pack(pady=5)

    def view_all(table, columns, col_names, title):
        win = t.Toplevel(root)
        win.title(title)
        win.geometry("800x400")
        tree = ttk.Treeview(win, columns=columns, show="headings")
        for i, c in enumerate(columns):
            tree.heading(c, text=col_names[i])
            tree.column(c, width=120)
        tree.pack(fill="both", expand=True)

        db = get_db()
        cur = db.cursor()
        cur.execute(f"SELECT {','.join(columns)} FROM {table}")
        for row in cur.fetchall():
            tree.insert("", "end", values=row)
        db.close()

    # Buttons for admin actions
    t.Button(root, text="View All Users", command=view_users).pack(pady=5)
    t.Button(root, text="View All Documents",
             command=lambda: view_all("documents", ["id","username","platform","doc_name","file_path"],
                                      ["ID","Username","Platform","Doc Name","File Path"], "All Documents")).pack(pady=5)
    t.Button(root, text="View All Credentials",
             command=lambda: view_all("credentials", ["id","username","account_type","account_username","account_password"],
                                      ["ID","Username","Type","Acc Username","Password"], "All Credentials")).pack(pady=5)
    t.Button(root, text="View All Medical Reports",
             command=lambda: view_all("medical_reports", ["id","username","report_name","hospital","file_path"],
                                      ["ID","Username","Report","Hospital","File Path"], "All Medical Reports")).pack(pady=5)
    t.Button(root, text="View All Notes",
             command=lambda: view_all("notes", ["id","username","title","content"],
                                      ["ID","Username","Title","Content"], "All Notes")).pack(pady=5)
    t.Button(root, text="Logout", command=loginPage).pack(pady=10)

# ---------------- REGISTER / LOGIN ----------------
def registerPage():
    clearWindow()
    root.title("DigiRaksha - Register")
    t.Label(root, text="Register", font=("Arial Black", 16)).pack(pady=10)
    t.Label(root, text="Username").pack()
    t.Entry(root, textvariable=reg_user).pack()
    t.Label(root, text="Password").pack()
    t.Entry(root, textvariable=reg_pass, show="*").pack()
    t.Button(root, text="Register", command=register_user).pack(pady=10)
    t.Button(root, text="Go to Login", command=loginPage).pack()

def loginPage():
    clearWindow()
    root.title("DigiRaksha - Login")
    t.Label(root, text="Login", font=("Arial Black", 16)).pack(pady=10)
    t.Label(root, text="Username").pack()
    t.Entry(root, textvariable=log_user).pack()
    t.Label(root, text="Password").pack()
    t.Entry(root, textvariable=log_pass, show="*").pack()
    t.Button(root, text="User Login", command=login_user).pack(pady=10)#User login button
    t.Button(root, text="Admin Login", command=admin_login).pack(pady=10)#Admin login button
    t.Button(root, text="Go to Register", command=registerPage).pack()

# ---------------- UTIL ----------------
def clearWindow():
    for w in root.winfo_children():
        w.destroy()

# ---------------- MAIN ----------------
root = t.Tk()
root.geometry("600x500")
root.title("DigiRaksha")

reg_user = t.StringVar()
reg_pass = t.StringVar()
log_user = t.StringVar()
log_pass = t.StringVar()
eplatform = t.StringVar()
edocname = t.StringVar()

init_db()
loginPage()
root.mainloop()
