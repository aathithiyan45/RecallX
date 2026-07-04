from core.logger import logger
from ai.embeddings.embedding_model import embedding_model
from ai.retrieval.vector_store import vector_store

text = "Java is an object oriented programming language."

embedding = embedding_model.encode(text)

vector_store.add_document(
    document_id="1",
    text=text,
    embedding=embedding,
    metadata={
        "file":"sample.txt"
    }
)

logger.info("Stored Successfully!")