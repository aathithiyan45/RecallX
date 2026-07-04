from core.logger import logger
from ai.chunking.chunker import text_chunker

text = """
Java is an object oriented programming language.

""" * 200

chunks = text_chunker.chunk(text)

logger.info(len(chunks))

for i, chunk in enumerate(chunks):

    logger.info("=" * 40)

    logger.info(f"Chunk {i+1}")

    logger.info(chunk[:200])