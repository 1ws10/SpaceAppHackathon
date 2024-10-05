import bcrypt
import sqlite3
import commands

def hashPassword(password: str) -> bytes:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed

def verifyPassword(stored_hash: bytes, password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), stored_hash)

def login(email: str, password: str) -> bool:        
    return verifyPassword(commands.getPassword(email), password)

def createLogin(email: str, password: str):
    try:
        commands.createUser(email, hashPassword(password))
    except sqlite3.IntegrityError as e:
        if "UNIQUE constraint failed: User.email" in str(e):
            print(f"Error: The email '{email}' is already registered.")
        else:
            print(f"SQLite error: {e}")
    return
