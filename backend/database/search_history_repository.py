from database.connection import get_connection


class SearchHistoryRepository:

    @staticmethod
    def save_history(query: str):
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(
            """
            INSERT INTO search_history(query)
            VALUES(?)
            """,
            (query,)
        )
        connection.commit()
        connection.close()

    @staticmethod
    def get_history(limit: int = 30):
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(
            """
            SELECT id, query, created_at
            FROM search_history
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,)
        )
        rows = cursor.fetchall()
        connection.close()
        return [dict(row) for row in rows]

    @staticmethod
    def delete_history(item_id: int):
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(
            """
            DELETE FROM search_history
            WHERE id = ?
            """,
            (item_id,)
        )
        connection.commit()
        connection.close()

    @staticmethod
    def clear_history():
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(
            """
            DELETE FROM search_history
            """
        )
        connection.commit()
        connection.close()


search_history_repository = SearchHistoryRepository()
