from docx import Document

from extractor.base_extractor import BaseExtractor


class DOCXExtractor(BaseExtractor):

    def extract(self, file_path: str) -> str:

        document = Document(file_path)

        text = ""

        for paragraph in document.paragraphs:
            text += paragraph.text + "\n"

        return text