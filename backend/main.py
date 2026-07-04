from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from api.folder import router as folder_router
from api.search import router as search_router
from api.chat import router as chat_router

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

@app.get("/")
def health():
    return {
        "project": "RecallX",
        "version": "1.0.0",
        "status": "Running"
    }