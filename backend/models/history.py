from pydantic import BaseModel


class HistoryRequest(BaseModel):
    query: str
