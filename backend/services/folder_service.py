from core.folder_validator import FolderValidator
from models.folder import FolderRequest
from database.folder_repository import folder_repository


class FolderService:

    @staticmethod
    def register_folder(folder: FolderRequest):

        valid, message = FolderValidator.validate(folder.path)

        if not valid:
            return {
                "success": False,
                "message": message
            }

        try:
            folder_repository.save_folder(folder.path)

            return {
                "success": True,
                "message": "Folder registered successfully.",
                "path": folder.path
            }

        except Exception as e:
            return {
                "success": False,
                "message": str(e)
            }

    @staticmethod
    def get_all_folders():
        return folder_repository.get_all_folders()


folder_service = FolderService()