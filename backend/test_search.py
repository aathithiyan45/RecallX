from core.logger import logger
from ai.embeddings.embedding_model import embedding_model
from ai.retrieval.vector_store import vector_store

query = "Programming language"

query_embedding = embedding_model.encode(query)

results = vector_store.search(
    query_embedding=query_embedding,
    top_k=3
)

logger.info(results)