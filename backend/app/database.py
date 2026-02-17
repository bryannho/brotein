import sqlite3
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "bigger.db"


def init_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at DATETIME NOT NULL
        );

        CREATE TABLE IF NOT EXISTS meals (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id),
            meal_date DATE NOT NULL,
            text_input TEXT,
            calories INTEGER NOT NULL DEFAULT 0,
            protein REAL NOT NULL DEFAULT 0,
            carbs REAL NOT NULL DEFAULT 0,
            sugar REAL NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL
        );

        CREATE TABLE IF NOT EXISTS goals (
            user_id TEXT PRIMARY KEY REFERENCES users(id),
            calories_goal INTEGER NOT NULL,
            protein_goal REAL NOT NULL,
            carbs_goal REAL NOT NULL,
            sugar_goal REAL NOT NULL,
            updated_at DATETIME NOT NULL
        );
    """)
    conn.close()


@contextmanager
def get_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
