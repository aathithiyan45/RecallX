import requests
from core.exceptions import OllamaUnavailableError
from core.config import OLLAMA_URL, OLLAMA_MODEL


class OllamaClient:

    def __init__(self):

        self.url = f"{OLLAMA_URL}/api/generate"

        self.model = OLLAMA_MODEL

    def generate(self, prompt: str):

        try:
            response = requests.post(

                self.url,

                json={

                    "model": self.model,

                    "prompt": prompt,

                    "stream": False

                }

            )

            response.raise_for_status()

            data = response.json()

            return data["response"]
        except requests.exceptions.RequestException as e:
            raise OllamaUnavailableError("Ollama server is unavailable.") from e


ollama_client = OllamaClient()