from services.search_service import search_service
from ai.prompts.prompt_builder import prompt_builder
from ai.llm.client import ollama_client


class OllamaService:

    @staticmethod
    def ask(question: str):

        # Search relevant chunks
        search_results = search_service.search(question)

        # Return fallback answer directly when ZERO chunks are found
        if not search_results:
            return {
                "question": question,
                "answer": "I couldn't find that information in your knowledge library.",
                "sources": []
            }

        # Build prompt
        prompt = prompt_builder.build(
            question,
            search_results
        )

        # Generate answer
        answer = ollama_client.generate(prompt)

        # Format sources
        formatted_sources = []

        for result in search_results:

            formatted_sources.append(
                {
                    "file": result["metadata"]["file"],
                    "chunk": result["metadata"]["chunk"],
                    "score": round(result["score"], 4),
                    "text": result["document"]
                }
            )

        return {
            "question": question,
            "answer": answer,
            "sources": formatted_sources
        }


ollama_service = OllamaService()