from database.connection import get_connection


class IndexedFileRepository:

    @staticmethod
    def get_hash(path: str):

        connection = get_connection()

        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT hash
            FROM indexed_files
            WHERE path = ?
            """,
            (path,)
        )

        row = cursor.fetchone()

        connection.close()

        if row:
            return row["hash"]

        return None

    @staticmethod
    def save_hash(
        path: str,
        hash_value: str
    ):

        connection = get_connection()

        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT OR REPLACE INTO indexed_files(
                path,
                hash
            )
            VALUES(
                ?,?
            )
            """,
            (
                path,
                hash_value
            )
        )

        connection.commit()

        connection.close()


indexed_file_repository = IndexedFileRepository()