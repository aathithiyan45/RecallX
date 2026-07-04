from core.logger import logger
from extractor.extractor_factory import ExtractorFactory

file_path = "/Users/athiselvam/Documents/sample.txt"   # Change this

extractor = ExtractorFactory.get_extractor(file_path)

if extractor:

    text = extractor.extract(file_path)

    logger.info(text[:500])

else:

    logger.error("Unsupported file.")