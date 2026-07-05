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

            # Register scan-then-watch lifecycle in background daemon thread
            import threading
            from watcher.folder_watcher import folder_watcher

            def run_scan_and_watch(path):
                # 1. Scan directory and index new/modified files first
                folder_watcher.scan_and_index(path)
                # 2. Start watchdog observer watching for filesystem events
                folder_watcher.start(path)

            threading.Thread(target=run_scan_and_watch, args=(folder.path,), daemon=True).start()

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
        from database.indexed_file_repository import indexed_file_repository
        from pathlib import Path
        
        folders = folder_repository.get_all_folders()
        result = []
        
        for folder in folders:
            folder_dict = dict(folder)
            folder_path = folder_dict["path"]
            
            # Fetch real files from database
            files = indexed_file_repository.get_files_for_folder(folder_path)
            
            # Compute stats
            file_count = len(files)
            
            # Find last_indexed (max updated_at)
            last_indexed = None
            if file_count > 0:
                try:
                    last_indexed = max(f["updated_at"] for f in files)
                except Exception:
                    pass
            
            result.append({
                "id": folder_dict["id"],
                "name": Path(folder_path).name or folder_path,
                "path": folder_path,
                "watching": True,
                "status": "watching",
                "file_count": file_count,
                "last_indexed": last_indexed,
                "files": files
            })
            
        return result


folder_service = FolderService()