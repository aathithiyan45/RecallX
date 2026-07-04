from ai.embeddings.embedding_model import embedding_model
from ai.retrieval.vector_store import vector_store
from core.config import TOP_K


class SearchService:

    @staticmethod
    def search(query: str):

        query_embedding = embedding_model.encode(query)

        results = vector_store.search(
            query_embedding=query_embedding,
            top_k=TOP_K
        )

        return results


search_service = SearchService()