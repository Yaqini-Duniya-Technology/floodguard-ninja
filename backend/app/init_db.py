"""Initialize the FloodGuard AI PostgreSQL reporting schema.

Run explicitly before starting the production API.
"""

from .database import database_engine, initialize_schema, open_database


def main():
    engine = database_engine()

    if engine != "postgresql":
        raise RuntimeError(
            "PostgreSQL initialization requires a valid DATABASE_URL."
        )

    with open_database() as connection:
        initialize_schema(connection)

    print("SUCCESS: PostgreSQL reporting schema initialized.")


if __name__ == "__main__":
    main()
