from pathlib import Path

from extractor.pdf_extractor import PDFExtractor
from extractor.docx_extractor import DOCXExtractor
from extractor.text_extractor import TextExtractor


class ExtractorFactory:

    @staticmethod
    def get_extractor(file_path: str):

        extension = Path(file_path).suffix.lower()

        if extension == ".pdf":
            return PDFExtractor()

        elif extension == ".docx":
            return DOCXExtractor()

        elif extension in [".txt", ".java", ".py", ".js", ".md"]:
            return TextExtractor()

        return None