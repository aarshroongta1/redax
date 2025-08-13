from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
from app.controllers.controller import output_redacted, get_guest_token_file
from app.db.session import get_db
from app.models.document import User, Document
from app.auth.util import get_optional_user, get_current_user
import io
from typing import Optional

router = APIRouter()

@router.post("/upload")
async def ocr(
    current_user: Optional[User] = Depends(get_optional_user),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    return await output_redacted(current_user, file, db)

@router.get("/download/{docId}")
def get_redacted(docId: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == docId).first()
    if not doc or not doc.redacted_data:
        raise HTTPException(status_code=404, detail="Redacted document not found")
    if not current_user or doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to access this document")
    return StreamingResponse(
    content=io.BytesIO(doc.redacted_data),
    media_type="application/pdf",
    headers={
        "Content-Disposition": f'inline; filename="{doc.filename}"',
        "Filename": doc.filename,
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Credentials": "true",
    }
)

@router.get("/download/guest/{token}")
def get_guest_file(token: str, db: Session = Depends(get_db)):
    response = get_guest_token_file(db, token)
    if not response:
        raise HTTPException(status_code=403, detail="Invalid or expired token")
    return response

@router.get("/history")
def get_user_history(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    documents = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .all()
    )

    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "created_at": doc.created_at.isoformat(),
        }
        for doc in documents
    ]