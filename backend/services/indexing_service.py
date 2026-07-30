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

            pages = extractor.extract(file_path)

            if not pages:
                logger.error("File contains no readable text.")
                return

            filename = Path(file_path).name

            # Remove previous vectors for this file
            vector_store.delete_file(file_path)

            import hashlib
            path_hash = hashlib.sha256(file_path.encode("utf-8")).hexdigest()

            chunk_global_index = 0
            for page_data in pages:
                page_num = page_data["page"]
                page_text = page_data["text"]

                page_chunks = text_chunker.chunk(page_text)

                for chunk in page_chunks:
                    if not chunk.strip():
                        continue

                    embedding = embedding_model.encode(chunk)

                    vector_store.add_document(
                        document_id=f"{path_hash}_{chunk_global_index}",
                        text=chunk,
                        embedding=embedding,
                        metadata={
                            "file": filename,
                            "path": file_path,
                            "chunk": chunk_global_index,
                            "page": page_num
                        }
                    )
                    chunk_global_index += 1

            logger.info(f"Indexed {chunk_global_index} chunk(s) across {len(pages)} page(s).")

            indexed_file_repository.save_hash(
                file_path,
                current_hash
            )
        except Exception as e:
            logger.error(f"Failed to index file {file_path}: {e}")


indexing_service = IndexingService()