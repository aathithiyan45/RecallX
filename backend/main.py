from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from api.folder import router as folder_router
from api.search import router as search_router
from api.chat import router as chat_router
from api.history import router as history_router

from database.connection import initialize_database
from core.exceptions import OllamaUnavailableError, DatabaseError, ExtractionError
from core.logger import logger

app = FastAPI(
    title="RecallX API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers
@app.exception_handler(OllamaUnavailableError)
async def ollama_unavailable_handler(request, exc):
    logger.error(f"Ollama Unavailable Exception: {exc}")
    return JSONResponse(
        status_code=503,
        content={
            "success": False,
            "message": "Ollama server is unavailable."
        }
    )


@app.exception_handler(DatabaseError)
async def database_error_handler(request, exc):
    logger.error(f"Database Exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Database error has occurred."
        }
    )


@app.exception_handler(ExtractionError)
async def extraction_error_handler(request, exc):
    logger.error(f"Extraction Exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "PDF extraction failed."
        }
    )


@app.exception_handler(Exception)
async def fallback_exception_handler(request, exc):
    logger.exception(f"Unhandled Exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An unexpected error occurred."
        }
    )


# Initialize SQLite Database
initialize_database()

import threading
from database.folder_repository import folder_repository
from watcher.folder_watcher import folder_watcher

def sync_folders_and_start_watching():
    logger.info("Initializing folder watchers and database sync...")
    try:
        folders = folder_repository.get_all_folders()
        for folder in folders:
            folder_path = folder["path"]
            logger.info(f"Starting startup sync sequence for: {folder_path}")
            # Scan and compare hashes sequentially first
            folder_watcher.scan_and_index(folder_path)
            # After scanning completes, schedule and start live watchdog events
            folder_watcher.start(folder_path)
        logger.info("Folder startup synchronization complete.")
    except Exception as e:
        logger.error(f"Error syncing folders during startup: {e}")

# Run startup sync in background thread to avoid blocking server boot
threading.Thread(target=sync_folders_and_start_watching, daemon=True).start()


# Folder APIs
app.include_router(
    folder_router,
    prefix="/folders",
    tags=["Folders"]
)


# Search APIs
app.include_router(
    search_router,
    prefix="/search",
    tags=["Search"]
)

# Chat APIs
app.include_router(
    chat_router,
    prefix="/chat",
    tags=["Chat"]
)

# History APIs
app.include_router(
    history_router,
    prefix="/history",
    tags=["History"]
)

@app.get("/")
def health():
    return {
        "project": "RecallX",
        "version": "1.0.0",
        "status": "Running"
    }