from services.search_service import search_service
from ai.prompts.prompt_builder import prompt_builder
from ai.llm.client import ollama_client
from core.config import MAX_DISTANCE


def validate_context_evidence(question: str, search_results: list):
    from services.query_normalizer import query_normalizer
    
    # Normalize the query first to filter out conversational terms and spelling typos
    normalized_question = query_normalizer.normalize(question)
    
    import re
    words = re.findall(r'\b\w+\b', normalized_question.lower())
    # Keep only non-filler keywords
    keywords = [w for w in words if w not in query_normalizer.FILLER_WORDS and not w.isdigit()]
    
    if not keywords:
        return True, [], []
        
    merged_context = " ".join([r["document"].lower() for r in search_results])
    
    missing_keywords = []
    present_keywords = []
    
    for kw in keywords:
        # Check if the keyword or its prefix (e.g., "auth" for "authentication") is present in the context
        if kw in merged_context or (len(kw) > 4 and kw[:4] in merged_context):
            present_keywords.append(kw)
        else:
            missing_keywords.append(kw)
            
    if missing_keywords:
        return False, present_keywords, missing_keywords
        
    return True, present_keywords, []


class OllamaService:

    @staticmethod
    def ask(question: str):

        # Search relevant chunks
        search_results = search_service.search(question)

        # Filter chunks that pass the relevance threshold (score <= MAX_DISTANCE)
        filtered_results = [r for r in search_results if r["score"] <= MAX_DISTANCE]

        # Return fallback answer directly when ZERO chunks pass the threshold
        if not filtered_results:
            return {
                "grounded": False,
                "question": question,
                "answer": "I couldn't find this information in your knowledge library.",
                "sources": []
            }

        # Validate context evidence before calling LLM to prevent semantic expansion
        is_valid, present_kws, missing_kws = validate_context_evidence(question, filtered_results)

        if not is_valid:
            first_doc = filtered_results[0]["metadata"]["file"]
            if present_kws:
                mentioned_topics = ", ".join([w.title() for w in present_kws])
                missing_topics = " ".join([w.title() for w in missing_kws])
                answer = f"I found a related document ({first_doc}) mentioning {mentioned_topics}, but I could not find any notes specifically about {missing_topics} in your knowledge library."
            else:
                answer = "I couldn't find this information in your knowledge library."

            return {
                "grounded": False,
                "question": question,
                "answer": answer,
                "sources": []
            }

        # Build prompt using only filtered results
        prompt = prompt_builder.build(
            question,
            filtered_results
        )

        # Generate answer
        llm_response = ollama_client.generate(prompt)

        # Prepend the correct source filename and page number programmatically
        first_metadata = filtered_results[0]["metadata"]
        first_doc = first_metadata["file"]
        page_num = first_metadata.get("page")

        source_info = f"📄 Source\n{first_doc}"
        if page_num is not None:
            source_info += f"\n📑 Page {page_num}"

        answer = f"{source_info}\n\n{llm_response.strip()}"

        # Format sources using only filtered results
        formatted_sources = []

        for result in filtered_results:
            meta = result["metadata"]
            formatted_sources.append(
                {
                    "file": meta["file"],
                    "filename": meta["file"],
                    "chunk": meta["chunk"],
                    "page": meta.get("page"),
                    "score": round(result["score"], 4),
                    "distance": round(result["score"], 4),
                    "text": result["document"]
                }
            )

        return {
            "grounded": True,
            "question": question,
            "answer": answer,
            "sources": formatted_sources
        }


ollama_service = OllamaService()