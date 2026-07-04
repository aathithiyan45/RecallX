import fitz

from extractor.base_extractor import BaseExtractor
from core.exceptions import ExtractionError


class PDFExtractor(BaseExtractor):

    def extract(self, file_path: str) -> str:

        try:
            document = fitz.open(file_path)

            text = ""

            for page in document:
                text += page.get_text()

            document.close()

            return text
        except Exception as e:
            raise ExtractionError("PDF extraction failed.") from e