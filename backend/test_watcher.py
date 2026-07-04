import time

from watcher.folder_watcher import folder_watcher

folder = "/Users/athiselvam/Documents"

folder_watcher.start(folder)

try:
    while True:
        time.sleep(1)

except KeyboardInterrupt:
    folder_watcher.stop()