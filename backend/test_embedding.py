from core.logger import logger
from ai.embeddings.embedding_model import embedding_model

text = """
Java is an object oriented programming language.
"""

embedding = embedding_model.encode(text)

logger.info(type(embedding))

logger.info(len(embedding))

logger.info(embedding[:10])