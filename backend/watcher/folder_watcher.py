from watchdog.observers import Observer

from watcher.file_handler import FileHandler
from core.logger import logger


class FolderWatcher:

    def __init__(self):
        self.observer = Observer()

    def start(self, folder_path: str):

        event_handler = FileHandler()

        self.observer.schedule(
            event_handler,
            folder_path,
            recursive=True
        )

        self.observer.start()

        logger.info(f"Watching: {folder_path}")

    def stop(self):

        self.observer.stop()
        self.observer.join()


folder_watcher = FolderWatcher()