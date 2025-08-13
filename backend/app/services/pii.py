import google.cloud.dlp_v2
from presidio_analyzer import AnalyzerEngine


def detect_pii_presidio(text: str):
    findings = []
    
    analyzer = AnalyzerEngine()

    ENTITY_TYPES = ["NRP", "PHONE_NUMBER", "EMAIL_ADDRESS", "ADDRESS", "CREDIT_CARD", "DATE_TIME", "IBAN_CODE", "LOCATION", "PERSON", "IN_PAN", "IN_AADHAAR", "IN_PASSPORT"]

    results = analyzer.analyze(
        text=text,
        entities=ENTITY_TYPES,
        language="en"
    )
    
    for r in results:
        if r.score >= 0.6:
            findings.append({
                "text": text[r.start:r.end],
                "info_type": r.entity_type,
                "location": [r.start, r.end],
                "score": r.score
            })

    
    return findings if findings else None


def detect_pii_dlp(text: str):
    project_id = "poised-rock-464510-t1"
    processor_id = "e5ade687b3de2ccb"
    location = "us"

    findings = []
    info_types = ["CREDIT_CARD_DATA", "DEMOGRAPHIC_DATA", "FINANCIAL_ID", "GOVERNMENT_ID", "GEOGRAPHIC_DATA", "MEDICAL_DATA", "PASSPORT", "SECURITY_DATA", "PHONE_NUMBER", "TECHNICAL_ID", "PERSON_NAME"]
    dlp = google.cloud.dlp_v2.DlpServiceClient()
    parent = f"projects/{project_id}"
    inspect_config = {
        "info_types": [{"name": info_type} for info_type in info_types],
        "include_quote": True,
    }
    item = {"value": text}
    response = dlp.inspect_content(
        request={"parent": parent, "inspect_config": inspect_config, "item": item}
    )
    if response.result.findings:
        for f in response.result.findings:
            if f.likelihood.name in ["LIKELY", "VERY_LIKELY"]:
                findings.append({
                    "text": f.quote,
                    "info_type": f.info_type.name,
                    "location": [
                        f.location.codepoint_range.start,
                        f.location.codepoint_range.end
                    ],
                    "likelihood": f.likelihood.name
                })

    return findings if findings else None