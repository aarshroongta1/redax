from PIL import ImageDraw

def get_boxes(page):
    token_boxes = []
    for token in page.tokens:
        text_anchor = token.layout.text_anchor.text_segments[0]
        start = text_anchor.start_index
        end = text_anchor.end_index
        box = [(v.x, v.y) for v in token.layout.bounding_poly.vertices]
        token_boxes.append({"start": start, "end": end, "bbox": box})
    return token_boxes

def match_pii_to_boxes(pii_findings, token_boxes):
    matched_boxes = []
    for pii in pii_findings:
        start, end = pii.get("location")
        for token in token_boxes:
            if token["start"] <= start < token["end"] or token["start"] < end <= token["end"]:
                matched_boxes.append(token["bbox"])
    return matched_boxes

def scale_box(bbox, image_width, image_height, doc_width, doc_height):
    scale_x = image_width / doc_width
    scale_y = image_height / doc_height
    return [(int(x * scale_x), int(y * scale_y)) for x, y in bbox]

def redact_page(image, page, pii_entities):
    img = image.convert("RGB")
    draw = ImageDraw.Draw(img)

    token_boxes = get_boxes(page)
    matched_boxes = match_pii_to_boxes(pii_entities, token_boxes)

    for box in matched_boxes:
        scaled = scale_box(box, img.width, img.height, page.dimension.width, page.dimension.height)
        draw.polygon(scaled, fill="black")

    return img
