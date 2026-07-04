import chromadb
from pathlib import Path
from core.exceptions import DatabaseError


class VectorStore:

    def __init__(self):

        db_path = (
            Path(__file__).resolve().parents[3]
            / "database"
            / "chroma_db"
        )

        try:
            self.client = chromadb.PersistentClient(
                path=str(db_path)
            )

            self.collection = self.client.get_or_create_collection(
                name="recallx"
            )
        except Exception as e:
            raise DatabaseError("Database error has occurred.") from e

    def add_document(
        self,
        document_id: str,
        text: str,
        embedding: list,
        metadata: dict
    ):

        try:
            self.collection.add(
                ids=[document_id],
                documents=[text],
                embeddings=[embedding],
                metadatas=[metadata]
            )
        except Exception as e:
            raise DatabaseError("Database error has occurred.") from e

    def search(
        self,
        query_embedding: list,
        top_k: int = 5
    ):

        try:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k
            )
        except Exception as e:
            raise DatabaseError("Database error has occurred.") from e

        formatted_results = []

        documents = results["documents"][0]
        metadatas = results["metadatas"][0]
        distances = results["distances"][0]

        for document, metadata, distance in zip(
            documents,
            metadatas,
            distances
        ):

            formatted_results.append(
                {
                    "document": document,
                    "metadata": metadata,
                    "score": round(distance, 4)
                }
            )

        return formatted_results

    def delete_file(self, filename: str):

        try:
            self.collection.delete(
                where={
                    "file": filename
                }
            )
        except Exception:
            pass


vector_store = VectorStore()