import sqlite3
import json


class ResearchMemory:

    def __init__(self, database_path="novia_memory.db"):

        self.database_path = database_path

        self.connection = sqlite3.connect(
            self.database_path,
            check_same_thread=False
        )

        self._create_table()

    def _create_table(self):

        cursor = self.connection.cursor()

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS research_memory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                research_id INTEGER,
                research_question TEXT,
                research_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        self.connection.commit()

    def store(self, research_data):

        research_project = research_data.get(
            "research_project",
            {}
        )

        research_id = research_project.get(
            "id"
        )

        research_question = research_project.get(
            "research_question"
        )

        cursor = self.connection.cursor()

        cursor.execute(
            """
            INSERT INTO research_memory
            (
                research_id,
                research_question,
                research_data
            )
            VALUES (?, ?, ?)
            """,
            (
                research_id,
                research_question,
                json.dumps(
                    research_data,
                    default=str
                )
            )
        )

        self.connection.commit()

        return {
            "status": "stored",
            "memory_id": cursor.lastrowid
        }

    def get_all(self):

        cursor = self.connection.cursor()

        cursor.execute(
            """
            SELECT
                id,
                research_id,
                research_question,
                research_data,
                created_at
            FROM research_memory
            ORDER BY id ASC
            """
        )

        rows = cursor.fetchall()

        results = []

        for row in rows:

            results.append(
                {
                    "memory_id": row[0],
                    "research_id": row[1],
                    "research_question": row[2],
                    "research_data": json.loads(row[3]),
                    "created_at": row[4]
                }
            )

        return results

    def get_latest(self):

        cursor = self.connection.cursor()

        cursor.execute(
            """
            SELECT
                id,
                research_id,
                research_question,
                research_data,
                created_at
            FROM research_memory
            ORDER BY id DESC
            LIMIT 1
            """
        )

        row = cursor.fetchone()

        if not row:
            return None

        return {
            "memory_id": row[0],
            "research_id": row[1],
            "research_question": row[2],
            "research_data": json.loads(row[3]),
            "created_at": row[4]
        }

    def get_by_research_id(self, research_id):

        cursor = self.connection.cursor()

        cursor.execute(
            """
            SELECT
                id,
                research_id,
                research_question,
                research_data,
                created_at
            FROM research_memory
            WHERE research_id = ?
            ORDER BY id DESC
            """,
            (research_id,)
        )

        rows = cursor.fetchall()

        results = []

        for row in rows:

            results.append(
                {
                    "memory_id": row[0],
                    "research_id": row[1],
                    "research_question": row[2],
                    "research_data": json.loads(row[3]),
                    "created_at": row[4]
                }
            )

        return results

    def clear(self):

        cursor = self.connection.cursor()

        cursor.execute(
            "DELETE FROM research_memory"
        )

        self.connection.commit()

        return {
            "status": "memory_cleared"
        }