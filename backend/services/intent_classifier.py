import re


class IntentClassifier:

    SUMMARY_KEYWORDS = {
        "summarize",
        "summary",
        "overview",
        "everything",
        "all notes",
        "all documents",
        "brief",
        "key points",
        "revision",
        "study notes"
    }

    @classmethod
    def detect_intent(cls, query: str) -> str:
        query_lower = query.lower()

        # Check if any summary keywords appear in the query
        for kw in cls.SUMMARY_KEYWORDS:
            pattern = r"\b" + re.escape(kw) + r"\b"
            if re.search(pattern, query_lower):
                return "SUMMARY"

        return "RETRIEVAL"

    @classmethod
    def extract_topic(cls, query: str) -> str:
        # Lowercase and clean
        cleaned = query.strip()
        # Remove trailing question mark/period
        cleaned = re.sub(r"[?.!]$", "", cleaned).strip()

        # Prefixes to strip out to isolate the search topic
        prefixes = [
            r"summarize everything i saved about",
            r"summarize everything about",
            r"summarize my",
            r"summarize all",
            r"summarize all notes about",
            r"summarize all documents about",
            r"summarize",
            r"give me an overview of",
            r"give an overview of",
            r"overview of",
            r"give me a summary of",
            r"give a summary of",
            r"key points of",
            r"key points about",
            r"revision notes for",
            r"revision notes on",
            r"study notes for",
            r"study notes on"
        ]

        for prefix in prefixes:
            pattern = r"^\s*" + prefix + r"\s+"
            match = re.search(pattern, cleaned, re.IGNORECASE)
            if match:
                cleaned = cleaned[match.end():].strip()
                break

        return cleaned if cleaned else query


intent_classifier = IntentClassifier()
