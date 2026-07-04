from fastapi import APIRouter

from models.chat import ChatRequest
from services.ollama_service import ollama_service

router = APIRouter()


@router.post("/")
def chat(request: ChatRequest):

    return ollama_service.ask(
        request.question
    )