from fastapi import APIRouter
from models.folder import FolderRequest
from services.folder_service import folder_service

router = APIRouter()


@router.post("/")
def register_folder(folder: FolderRequest):
    return folder_service.register_folder(folder)


@router.get("/")
def get_folders():
    return folder_service.get_all_folders()


@router.get("/preview")
def preview_file(path: str):
    return folder_service.preview_file(path)