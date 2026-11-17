
from paddleocr import PaddleOCR
import sys
import os

if len(sys.argv) < 2:
    print("Please provide an invoice image path.")
    sys.exit(1)

image_path = sys.argv[1]

if not os.path.exists(image_path):
    print("Image file not found:", image_path)
    sys.exit(1)

print("Loading PaddleOCR...")

ocr = PaddleOCR(
    lang="en",
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False
)

print("Reading invoice...")

results = ocr.predict(input=image_path)

for result in results:
    data = result.json

    if isinstance(data, dict):
        data = data.get("res", data)

    texts = data.get("rec_texts", [])
    scores = data.get("rec_scores", [])

    print("\n========== EXTRACTED TEXT ==========\n")

    for text, score in zip(texts, scores):
        print(f"{text}  (Confidence: {score:.2f})")

print("\nOCR testing completed!")
