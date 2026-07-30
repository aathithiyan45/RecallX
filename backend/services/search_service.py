from ai.embeddings.embedding_model import embedding_model
from ai.retrieval.vector_store import vector_store
from core.config import TOP_K
from services.query_normalizer import query_normalizer
from core.logger import logger


class SearchService:

    @staticmethod
    def search(query: str):
        normalized_query = query_normalizer.normalize(query)

        logger.info(f"Original Query: {query}")
        logger.info(f"Normalized Query: {normalized_query}")

        query_embedding = embedding_model.encode(normalized_query)

        results = vector_store.search(
            query_embedding=query_embedding,
            top_k=TOP_K
        )

        logger.info(f"Retrieved Scores: {[r['score'] for r in results]}")

        return results


search_service = SearchService()