from services.search_service import search_service
from services.ollama_service import extract_best_sentence
from ai.llm.client import ollama_client
from core.config import MAX_DISTANCE


class SummaryService:

    @staticmethod
    def summarize(question: str, topic: str):
        # 1. Retrieve MANY relevant chunks using the extracted topic
        search_results = search_service.search(query=topic, top_k=20)

        # 2. Filter results using the configured distance threshold
        filtered_results = [r for r in search_results if r["score"] <= MAX_DISTANCE]

        if not filtered_results:
            return {
                "grounded": False,
                "question": question,
                "answer": "I couldn't find this information in your knowledge library.",
                "sources": []
            }

        # 3. Deduplicate chunks by document text
        seen_texts = set()
        unique_results = []
        for res in filtered_results:
            text_strip = res["document"].strip()
            if text_strip not in seen_texts:
                seen_texts.add(text_strip)
                unique_results.append(res)

        # 4. Sort results by source file and ascending page number
        def sort_key(res):
            meta = res.get("metadata", {})
            filename = meta.get("file", "")
            page = meta.get("page", 0)
            try:
                page_num = int(page)
            except (ValueError, TypeError):
                page_num = 0
            return (filename, page_num)

        unique_results.sort(key=sort_key)

        # 5. Build merged context block
        context_str = ""
        for result in unique_results:
            meta = result["metadata"]
            filename = meta.get("file", "Unknown Document")
            page = meta.get("page", "Unknown Page")
            context_str += f"Source Document: {filename} (Page {page})\nContent:\n{result['document']}\n---------------------\n\n"

        # 6. Format Summary Prompt
        prompt = f"""You are RecallX, an AI Personal Knowledge Memory assistant.

Instructions:
- Summarize ONLY the retrieved context below.
- Do not invent information.
- Group similar concepts.
- Produce concise study notes.
- Mention source documents and pages at the end under a "Sources" header.
- Format the output professionally using markdown.
- Do NOT write any introduction or say "Here is a summary".

======================
Context
======================
{context_str}

======================
Question
======================
Summarize the context about: {topic}

======================
Answer
======================
"""

        # 7. Generate consolidated study summary
        llm_response = ollama_client.generate(prompt)

        # 8. Format sources list returned to React
        formatted_sources = []
        for result in unique_results:
            meta = result["metadata"]
            matched_sentence = extract_best_sentence(result["document"], question)
            formatted_sources.append(
                {
                    "file": meta["file"],
                    "filename": meta["file"],
                    "path": meta.get("path"),
                    "chunk": meta["chunk"],
                    "page": meta.get("page"),
                    "score": round(result["score"], 4),
                    "distance": round(result["score"], 4),
                    "text": matched_sentence
                }
            )

        return {
            "grounded": True,
            "question": question,
            "answer": llm_response.strip(),
            "sources": formatted_sources
        }


summary_service = SummaryService()
