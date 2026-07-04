from pathlib import Path

from extractor.extractor_factory import ExtractorFactory
from ai.chunking.chunker import text_chunker
from ai.embeddings.embedding_model import embedding_model
from ai.retrieval.vector_store import vector_store
from services.hash_service import hash_service
from database.indexed_file_repository import indexed_file_repository
from core.logger import logger


class IndexingService:

    @staticmethod
    def index_file(file_path: str):

        try:
            logger.info(f"Indexing: {file_path}")

            current_hash = hash_service.calculate_hash(file_path)

            saved_hash = indexed_file_repository.get_hash(file_path)

            if current_hash == saved_hash:

                logger.info("No changes detected.")

                return

            extractor = ExtractorFactory.get_extractor(file_path)

            if extractor is None:
                logger.error("Unsupported file type.")
                return

            text = extractor.extract(file_path)

            if not text.strip():
                logger.error("File contains no readable text.")
                return

            chunks = text_chunker.chunk(text)

            filename = Path(file_path).name

            # Remove previous vectors for this file
            vector_store.delete_file(filename)

            for index, chunk in enumerate(chunks):

                embedding = embedding_model.encode(chunk)

                vector_store.add_document(
                    document_id=f"{filename}_{index}",
                    text=chunk,
                    embedding=embedding,
                    metadata={
                        "file": filename,
                        "path": file_path,
                        "chunk": index
                    }
                )

            logger.info(f"Indexed {len(chunks)} chunk(s).")

            indexed_file_repository.save_hash(
                file_path,
                current_hash
            )
        except Exception as e:
            logger.error(f"Failed to index file {file_path}: {e}")


indexing_service = IndexingService()