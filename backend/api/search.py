from fastapi import APIRouter

from models.search import SearchRequest
from services.search_service import search_service

router = APIRouter()


@router.post("/")
def search(request: SearchRequest):

    return search_service.search(
        request.query
    )