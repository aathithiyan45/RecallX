from core.config import CHUNK_SIZE, CHUNK_OVERLAP


class TextChunker:

    def __init__(
        self,
        chunk_size=500,
        overlap=50
    ):

        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk(self, text: str):

        words = text.split()

        chunks = []

        start = 0

        while start < len(words):

            end = start + self.chunk_size

            chunk = " ".join(words[start:end])

            chunks.append(chunk)

            start += self.chunk_size - self.overlap

        return chunks


text_chunker = TextChunker(chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP)