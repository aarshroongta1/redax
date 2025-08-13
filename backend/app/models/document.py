from sqlalchemy import Column, Integer, String, Text, LargeBinary, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timezone

Base = declarative_base()

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    data = Column(LargeBinary)
    redacted_data = Column(LargeBinary)
    layout = Column(LargeBinary)
    hash = Column(String, unique=True)
    extracted_text = Column(Text)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    owner = relationship("User", back_populates="documents")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    documents = relationship("Document", back_populates="owner")

class GuestDownloadToken(Base):
    __tablename__ = "guest_download_tokens"

    token = Column(String, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)