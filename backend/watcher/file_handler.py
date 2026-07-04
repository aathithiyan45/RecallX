from pathlib import Path

from watchdog.events import FileSystemEventHandler

from services.indexing_service import indexing_service
from watcher.debouncer import debouncer


class FileHandler(FileSystemEventHandler):

    def process(self, path):

        filename = Path(path).name

        if filename.startswith("."):
            return

        if filename.endswith("~"):
            return

        debouncer.debounce(

            path,

            lambda: indexing_service.index_file(path)

        )

    def on_created(self, event):

        if event.is_directory:
            return

        self.process(event.src_path)

    def on_modified(self, event):

        if event.is_directory:
            return

        self.process(event.src_path)