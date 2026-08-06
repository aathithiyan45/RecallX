from fastapi import APIRouter, HTTPException

from models.history import HistoryRequest
from database.search_history_repository import search_history_repository

router = APIRouter()


@router.get("/")
def get_history():
    try:
        items = search_history_repository.get_history(limit=30)
        return {"success": True, "history": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
def save_history(request: HistoryRequest):
    try:
        search_history_repository.save_history(request.query)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{item_id}")
def delete_history_item(item_id: int):
    try:
        search_history_repository.delete_history(item_id)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/")
def clear_all_history():
    try:
        search_history_repository.clear_history()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
