from watchdog.observers import Observer

from watcher.file_handler import FileHandler
from core.logger import logger
from pathlib import Path
from services.indexing_service import indexing_service


class FolderWatcher:

    def __init__(self):
        self.observer = Observer()
        self.started = False

    def start(self, folder_path: str):
        event_handler = FileHandler()
        self.observer.schedule(
            event_handler,
            folder_path,
            recursive=True
        )
        if not self.started:
            self.observer.start()
            self.started = True
            logger.info("Watchdog observer thread started successfully.")
        logger.info(f"Scheduled file watch for path: {folder_path}")

    def scan_and_index(self, folder_path: str):
        logger.info(f"Scanning directory for indexing: {folder_path}")
        path_obj = Path(folder_path)
        if not path_obj.exists() or not path_obj.is_dir():
            logger.error(f"Cannot scan path: {folder_path} (does not exist or not a directory)")
            return
            
        supported_exts = {'.pdf', '.docx', '.doc', '.txt', '.md'}
        indexed_count = 0
        
        for p in path_obj.rglob('*'):
            # Skip files in hidden directories (e.g. .venv, .git) and hidden files
            if p.is_file() and p.suffix.lower() in supported_exts:
                if any(part.startswith('.') for part in p.parts):
                    continue
                try:
                    indexing_service.index_file(str(p))
                    indexed_count += 1
                except Exception as e:
                    logger.error(f"Failed to index {p} during scan: {e}")
                    
        logger.info(f"Finished directory scan for {folder_path}. Indexed {indexed_count} files.")

    def stop(self):
        if self.started:
            self.observer.stop()
            self.observer.join()
            self.started = False


folder_watcher = FolderWatcher()