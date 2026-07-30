from extractor.base_extractor import BaseExtractor


class TextExtractor(BaseExtractor):

    def extract(self, file_path: str) -> list:

        with open(file_path, "r", encoding="utf-8") as file:
            return [{"page": 1, "text": file.read()}]