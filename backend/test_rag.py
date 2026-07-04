from core.logger import logger
from services.ollama_service import ollama_service

response = ollama_service.ask(
    "What is Java?"
)

logger.info("Question:")
logger.info(response["question"])

logger.info("Answer:")
logger.info(response["answer"])

logger.info("Sources:")
for source in response["sources"]:
    logger.info(source["metadata"]["file"])