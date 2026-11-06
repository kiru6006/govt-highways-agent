from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Document, User
from app.schemas import DocumentOut
from app.auth import get_current_user

router = APIRouter(prefix="/documents", tags=["Documents & Evidence Records"])

@router.get("", response_model=List[DocumentOut])
def list_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    docs = db.query(Document).order_by(Document.id.desc()).all()
    results = []
    for d in docs:
        results.append(DocumentOut(
            id=d.id,
            document_title=d.document_title,
            file_name=d.file_name,
            file_size_bytes=d.file_size_bytes,
            mime_type=d.mime_type,
            sha256_hash=d.sha256_hash,
            uploader_name=d.uploader.full_name if d.uploader else None,
            project_id=d.project_id,
            is_verified=d.is_verified,
            created_at=d.created_at
        ))
    return results

