from fastapi import UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse, StreamingResponse
from pdf2image import convert_from_bytes
from google.cloud.documentai_v1.types import Document as DocProto
import tempfile
import os
import io
from app.services.ocr import get_text
from app.services.pii import detect_pii_presidio, detect_pii_dlp
from app.services.redaction import redact_page
from app.services.hash import get_hash
from app.models.document import Document, User, GuestDownloadToken
from app.db.session import get_db
from app.db.session import SessionLocal
from sqlalchemy.orm import Session
from app.crud.crud import get_document_by_hash, create_document
import uuid
from datetime import datetime, timedelta, timezone
from app.services.smtp import send_email

def generate_guest_token(db: Session, document_id: int, expiration_minutes: int = 15):

    token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=expiration_minutes)

    file = db.query(Document).filter(Document.id == document_id).first()
    if not file:
        raise ValueError("Document not found")
    
    guest_token = GuestDownloadToken(
        token=token,
        document_id=document_id,
        expires_at=expires_at,
        used=False
    )
    
    db.add(guest_token)
    db.commit()
    db.refresh(guest_token)
    
    return token

def get_guest_token_file(db: Session, token: str):
    
    guest_token = db.query(GuestDownloadToken).filter(GuestDownloadToken.token == token).first()
    if not guest_token:
        return None
    if guest_token.used:
        return None
    if guest_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):        
        return None

    doc = db.query(Document).filter(Document.id == guest_token.document_id).first()
    if not doc:
        return None

    guest_token.used = True
    db.commit()

    return StreamingResponse(
        content=io.BytesIO(doc.redacted_data),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{doc.filename.replace(".pdf", "")}-redacted.pdf"',
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Credentials": "true",
        }
    )


async def output_redacted(current_user: User, file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    file_hash = get_hash(file_bytes)

    existing_doc = get_document_by_hash(db, file_hash)

    if existing_doc:
        if current_user:
            if current_user.id != existing_doc.user_id:
                new_doc = create_document(
                    db=db,
                    filename=existing_doc.filename,
                    file_bytes=existing_doc.data,
                    file_hash=existing_doc.hash,
                    layout_bytes=existing_doc.layout,
                    extracted_text=existing_doc.extracted_text,
                    user_id=current_user.id,
                    redacted_data=existing_doc.redacted_data
                )
                send_email(to_email=current_user.username, download_url=f"http://localhost:3000/download/{new_doc.id}", filename=new_doc.filename)
                return {"document_id": new_doc.id}
            else:
                send_email(to_email=current_user.username, download_url=f"http://localhost:3000/download/{existing_doc.id}", filename=existing_doc.filename)
                return {"document_id": existing_doc.id}
        else:
            token = generate_guest_token(db, existing_doc.id)
            return {"guest_token": token}
    
    ocr_text, document = get_text(file_bytes)

    pii_presidio = detect_pii_presidio(ocr_text)
    pii_dlp = detect_pii_dlp(ocr_text)
    all_pii = pii_dlp + pii_presidio
    images = convert_from_bytes(file_bytes)

    redacted_images = []
    for page, image in zip(document.pages, images):
        redacted_img = redact_page(image, page, all_pii)
        redacted_images.append(redacted_img)

    pdf_buffer = io.BytesIO()
    redacted_images[0].save(
        pdf_buffer,
        format="PDF",
        save_all=True,
        append_images=redacted_images[1:]
    )
    pdf_buffer.seek(0)
    redacted_data = pdf_buffer.read()

    layout_bytes = DocProto.serialize(document)

    new_doc = create_document(
        db=db,
        filename=file.filename,
        file_bytes=file_bytes,
        file_hash=file_hash,
        layout_bytes=layout_bytes,
        extracted_text=ocr_text,
        user_id = current_user.id if current_user else None,
        redacted_data=redacted_data
    )
    if current_user:
        send_email(to_email=current_user.username, download_url=f"http://localhost:3000/download/{new_doc.id}", filename=new_doc.filename)
        return {"document_id": new_doc.id}
    else:
        guest_token = generate_guest_token(db, new_doc.id)
        return {"guest_token": guest_token}
