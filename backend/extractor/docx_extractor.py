from docx import Document

from extractor.base_extractor import BaseExtractor


class DOCXExtractor(BaseExtractor):

    def extract(self, file_path: str) -> list:

        document = Document(file_path)

        text = ""

        for paragraph in document.paragraphs:
            text += paragraph.text + "\n"

        return [{"page": 1, "text": text}]