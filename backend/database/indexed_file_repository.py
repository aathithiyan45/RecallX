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

    @staticmethod
    def get_files_for_folder(folder_path: str):
        from pathlib import Path
        
        connection = get_connection()
        cursor = connection.cursor()
        
        # SQLite query for files starting with folder_path/
        # Strip trailing slashes to normalize prefix match
        normalized_path = folder_path.rstrip('/')
        cursor.execute(
            """
            SELECT path, updated_at
            FROM indexed_files
            WHERE path LIKE ?
            """,
            (f"{normalized_path}/%",)
        )
        
        rows = cursor.fetchall()
        connection.close()
        
        files = []
        for row in rows:
            file_path = row["path"]
            filename = Path(file_path).name
            
            ext = Path(file_path).suffix.lower()
            if ext == ".pdf":
                file_type = "PDF Document"
            elif ext in [".docx", ".doc"]:
                file_type = "Word Document"
            elif ext in [".txt", ".md"]:
                file_type = "Text Document"
            else:
                file_type = "Document"
                
            files.append(
                {
                    "path": file_path,
                    "name": filename,
                    "type": file_type,
                    "updated_at": row["updated_at"]
                }
            )
            
        return files


indexed_file_repository = IndexedFileRepository()