from core.logger import logger
from ai.llm.client import ollama_client

answer = ollama_client.generate(

    "What is Java?"

)

logger.info(answer)