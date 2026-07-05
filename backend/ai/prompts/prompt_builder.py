class PromptBuilder:

    @staticmethod
    def build(question: str, search_results: list):

        context = ""

        for result in search_results:

            context += result["document"] + "\n\n"

        prompt = f"""
You are RecallX, an AI Memory Assistant.

Answer ONLY using the information provided in the context below.

Rules:
- Do not make up information.
- If the answer is not present in the context, reply:
  "I couldn't find that information in your knowledge library."
- Keep the answer concise and accurate.

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