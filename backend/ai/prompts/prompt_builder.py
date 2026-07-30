class PromptBuilder:

    @staticmethod
    def build(question: str, search_results: list):

        context = ""
        for result in search_results:
            filename = result.get("metadata", {}).get("file", "Unknown Document")
            context += f"Source Document: {filename}\nContent:\n{result['document']}\n---------------------\n\n"

        prompt = f"""You are RecallX, an AI Personal Knowledge Memory assistant.
You help users remember information from their personal knowledge library.

Instructions:
- Answer ONLY using facts explicitly present in the retrieved context below.
- Do NOT infer.
- Do NOT summarize concepts that are not explained.
- Do NOT complete missing information.
- Do NOT use pretrained knowledge.
- If the retrieved text only mentions a topic, state that the topic is mentioned but not explained.
- Do NOT write any introduction or say "I found this in [Filename]". The system handles document name attribution automatically.
- Quote a short relevant excerpt from the context under the "Relevant excerpt:" header.

======================
Context
======================
{context}

======================
Question
======================
{question}

======================
Answer
======================
"""
        return prompt


prompt_builder = PromptBuilder()