from database.connection import get_connection


class FolderRepository:

    @staticmethod
    def save_folder(path: str):

        connection = get_connection()

        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO watched_folders(path)
            VALUES(?)
            """,
            (path,)
        )

        connection.commit()

        connection.close()

    @staticmethod
    def get_all_folders():

        connection = get_connection()

        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                id,
                path,
                created_at
            FROM watched_folders
            ORDER BY created_at DESC
            """
        )

        folders = cursor.fetchall()

        connection.close()

        return [dict(folder) for folder in folders]


folder_repository = FolderRepository()