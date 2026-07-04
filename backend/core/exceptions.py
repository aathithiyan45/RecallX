class RecallXError(Exception):
    """Base exception for RecallX application"""
    pass


class OllamaUnavailableError(RecallXError):
    """Raised when Ollama server is down or unreachable"""
    pass


class DatabaseError(RecallXError):
    """Raised when ChromaDB/SQLite operations fail"""
    pass


class ExtractionError(RecallXError):
    """Raised when text extraction from files (PDF/Docx/Text) fails"""
    pass
