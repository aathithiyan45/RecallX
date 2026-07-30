import re

class QueryNormalizer:
    # Set of known technical terms and abbreviations to preserve case and word-grouping
    TECHNICAL_TERMS = {
        "react hooks": "React Hooks",
        "fastapi": "FastAPI",
        "jwt": "JWT",
        "osi": "OSI",
        "tcp/ip": "TCP/IP",
        "sql join": "SQL JOIN",
        "rest api": "REST API",
        "docker compose": "Docker Compose",
        "binary search": "Binary Search",
        "dns": "DNS",
        "tcp": "TCP",
        "acid": "ACID",
        "docker": "Docker",
        "sql": "SQL"
    }

    # Ordered list of conversational phrases to strip (sorted by length descending for precedence)
    CONVERSATIONAL_PHRASES = [
        "what did i learn about",
        "where did i read about",
        "which document explains",
        "which pdf explains",
        "which file explains",
        "give me notes about",
        "tell me about",
        "where did i study",
        "where did i",
        "where can i",
        "search for",
        "find my",
        "show me",
        "search",
        "find",
        "explain",
        "explains",
        "what is"
    ]

    # Stopwords and filler terms to filter out of search queries (including pronouns, question words, and typos)
    FILLER_WORDS = {
        # Pronouns
        "i", "you", "he", "she", "they", "we", "it", "me", "my", "your", "his", "her",
        # Question words & common spelling typos
        "where", "wherre", "whre", "what", "wat", "which", "how", "why", "whyy", "who", "when",
        # Conversational verbs & matching forms
        "read", "study", "learn", "know", "tell", "get", "give", "show", "explain", "explains",
        "find", "finds", "search", "searches", "ask", "asking", "write", "writing",
        # Generic document-related terms
        "pdf", "pdfs", "document", "documents", "file", "files", "page", "pages", "notes", "notebook",
        "information", "info", "data", "details",
        # Common prepositions & connectives
        "about", "in", "on", "at", "by", "for", "to", "from", "of", "with", "this", "that",
        "these", "those", "here", "there", "the", "a", "an",
        # Modals & auxiliary verbs
        "can", "could", "would", "should", "will", "do", "does", "did", "is", "are", "was", "were",
        "have", "has", "had", "be", "been", "please", "thanks", "thank"
    }

    def __init__(self):
        # Sort conversational phrases descending by length to prevent partial matches
        sorted_phrases = sorted(self.CONVERSATIONAL_PHRASES, key=len, reverse=True)
        # Compile conversational pattern with word boundaries and case insensitivity
        self.phrase_pattern = re.compile(
            r'\b(' + '|'.join(sorted_phrases) + r')\b',
            flags=re.IGNORECASE
        )

    def normalize(self, query: str) -> str:
        if not query or not query.strip():
            return query

        placeholders = {}
        cleaned_query = query

        # 1. Substitute technical terms and abbreviations with placeholders
        # Sorted descending to substitute multi-word terms before single-word substrings
        sorted_terms = sorted(self.TECHNICAL_TERMS.keys(), key=len, reverse=True)
        for idx, term in enumerate(sorted_terms):
            pattern = r'\b' + re.escape(term) + r'\b'
            matches = re.findall(pattern, cleaned_query, flags=re.IGNORECASE)
            for _ in matches:
                placeholder = f"__TECH_TERM_{idx}__"
                placeholders[placeholder] = self.TECHNICAL_TERMS[term]
                cleaned_query = re.sub(pattern, placeholder, cleaned_query, count=1, flags=re.IGNORECASE)

        # 2. Remove conversational query phrases
        cleaned_query = self.phrase_pattern.sub("", cleaned_query)

        # 3. Clean leading/trailing punctuation and split into tokens
        raw_tokens = cleaned_query.split()
        cleaned_tokens = []
        for token in raw_tokens:
            # Strip non-alphanumeric punctuation from start/end of the token only (preserves middle slashes like TCP/IP)
            cleaned_token = re.sub(r'^[^a-zA-Z0-9_#]+|[^a-zA-Z0-9_#]+$', '', token)
            if cleaned_token:
                cleaned_tokens.append(cleaned_token)

        # 4. Filter out filler words and normalize regular word capitalization to lowercase
        final_tokens = []
        for token in cleaned_tokens:
            if token in placeholders:
                final_tokens.append(token)
                continue
            if token.lower() in self.FILLER_WORDS:
                continue
            final_tokens.append(token.lower())

        # 5. Restore technical terms placeholders
        restored_tokens = []
        for token in final_tokens:
            if token in placeholders:
                restored_tokens.append(placeholders[token])
            else:
                restored_tokens.append(token)

        # 6. Re-join tokens and normalize whitespace
        normalized = " ".join(restored_tokens).strip()

        # 7. Fallback to original query if the final normalized string is empty
        if not normalized:
            return query

        return normalized

query_normalizer = QueryNormalizer()
