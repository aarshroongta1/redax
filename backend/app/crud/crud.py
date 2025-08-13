from app.models.document import Document

def get_document_by_hash(db, file_hash: str):
    return db.query(Document).filter(Document.hash == file_hash).first()

def create_document(db, filename, file_bytes, file_hash, layout_bytes, extracted_text, user_id, redacted_data):
    doc = Document(
        filename=filename,
        data=file_bytes,
        redacted_data=redacted_data,
        hash=file_hash,
        layout=layout_bytes,
        extracted_text=extracted_text,
        user_id = user_id
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

