from google.api_core.client_options import ClientOptions
from google.cloud import documentai_v1

project_id = "poised-rock-464510-t1"
processor_id = "e5ade687b3de2ccb"
location = "us"
opts = ClientOptions(api_endpoint=f"{location}-documentai.googleapis.com")

def get_text(file_bytes: bytes):

    client = documentai_v1.DocumentProcessorServiceClient(client_options=opts)

    full_processor_name = client.processor_path(project_id, location, processor_id)

    request = documentai_v1.GetProcessorRequest(name=full_processor_name)
    processor = client.get_processor(request=request)

    raw_document = documentai_v1.RawDocument(
        content=file_bytes,
        mime_type="application/pdf",
    )

    request = documentai_v1.ProcessRequest(name=processor.name, raw_document=raw_document)
    result = client.process_document(request=request)
    document = result.document

    return result.document.text, result.document