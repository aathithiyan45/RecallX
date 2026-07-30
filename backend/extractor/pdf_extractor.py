import fitz

from extractor.base_extractor import BaseExtractor
from core.exceptions import ExtractionError


class PDFExtractor(BaseExtractor):

    def extract(self, file_path: str) -> list:

        try:
            document = fitz.open(file_path)

            pages = []

            for i, page in enumerate(document):
                text = page.get_text()
                if text.strip():
                    pages.append({
                        "page": i + 1,
                        "text": text
                    })

            document.close()

            return pages
        except Exception as e:
            raise ExtractionError("PDF extraction failed.") from e