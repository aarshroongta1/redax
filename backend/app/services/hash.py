import hashlib

def get_hash(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()
