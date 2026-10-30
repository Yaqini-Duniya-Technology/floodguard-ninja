"""Database connections for FloodGuard AI.

SQLite is used for local development.
PostgreSQL is selected when DATABASE_URL is configured.
"""

import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path

DEFAULT_SQLITE_PATH = Path(__file__).resolve().parents[1] / "floodguard.sqlite3"


def database_engine():
    url = os.getenv("DATABASE_URL", "").strip()

    if url:
        if not url.startswith(("postgresql://", "postgres://")):
            raise RuntimeError("DATABASE_URL must be a PostgreSQL connection URL")
        return "postgresql"

    if os.getenv("FLOODGUARD_ENV") == "production":
        raise RuntimeError("Production requires DATABASE_URL")

    return "sqlite"


@contextmanager
def open_database(sqlite_path=None):
    engine = database_engine()

    if engine == "postgresql":
        import psycopg
        from psycopg.rows import dict_row

        url = os.environ["DATABASE_URL"]

        with psycopg.connect(
            url,
            row_factory=dict_row,
            connect_timeout=10,
        ) as connection:
            yield connection

    else:
        path = Path(sqlite_path or DEFAULT_SQLITE_PATH)
        path.parent.mkdir(parents=True, exist_ok=True)

        connection = sqlite3.connect(path, timeout=10)
        connection.row_factory = sqlite3.Row

        try:
            with connection:
                connection.execute("PRAGMA busy_timeout=10000")
                connection.execute("PRAGMA journal_mode=WAL")
                yield connection
        finally:
            connection.close()

def initialize_schema(connection):
    """Create FloodGuard reporting tables for SQLite or PostgreSQL."""

    statements = [
        """
        CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            severity TEXT NOT NULL,
            location TEXT NOT NULL,
            description TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'PENDING'
        )
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_reports_timestamp
        ON reports(timestamp)
        """,
        """
        CREATE TABLE IF NOT EXISTS report_receipts (
            report_id TEXT PRIMARY KEY,
            token_hash TEXT NOT NULL,
            FOREIGN KEY(report_id) REFERENCES reports(id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS report_idempotency (
            key_hash TEXT PRIMARY KEY,
            payload_hash TEXT NOT NULL,
            report_id TEXT NOT NULL
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS report_postcodes (
            report_id TEXT PRIMARY KEY,
            postcode TEXT,
            verification_status TEXT NOT NULL,
            FOREIGN KEY(report_id) REFERENCES reports(id)
        )
        """,
    ]

    for statement in statements:
        connection.execute(statement)

class DatabaseSession:
    """Provide a small, consistent SQL interface for both database engines."""

    def __init__(self, connection, engine):
        self.connection = connection
        self.engine = engine

    def execute(self, query, parameters=None):
        parameters = () if parameters is None else parameters

        if self.engine == "postgresql":
            query = query.replace("?", "%s")

        return self.connection.execute(query, parameters)
