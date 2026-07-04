from pathlib import Path


class FolderValidator:

    @staticmethod
    def validate(path: str):

        folder = Path(path)

        if not folder.exists():
            return False, "Folder does not exist."

        if not folder.is_dir():
            return False, "Path is not a directory."

        return True, "Folder is valid."