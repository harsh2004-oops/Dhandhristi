import json
import logging
import re
import tempfile
from pathlib import Path
from threading import Lock
from time import perf_counter
from uuid import uuid4

import pypdfium2 as pdfium
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from paddleocr import PaddleOCR
from starlette.concurrency import run_in_threadpool


app = FastAPI(
    title="DhanDhristi OCR Service",
    description="Invoice upload and OCR processing service",
    version="2.1.0"
)

logger = logging.getLogger("uvicorn.error")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}

ocr_engine = None
_ocr_init_lock = Lock()
_ocr_predict_lock = Lock()


def get_ocr_engine():
    """Initialize PaddleOCR once, logging how long initialization takes."""
    global ocr_engine

    with _ocr_init_lock:
        if ocr_engine is None:
            logger.info("OCR DEBUG: PaddleOCR initialization started")
            started = perf_counter()

            ocr_engine = PaddleOCR(
                lang="en",
                use_doc_orientation_classify=False,
                use_doc_unwarping=False,
                use_textline_orientation=False
            )

            logger.info(
                "OCR DEBUG: PaddleOCR initialized in %.1f seconds",
                perf_counter() - started
            )

    return ocr_engine


def _as_list(value):
    if value is None:
        return []

    if isinstance(value, str):
        return [value]

    try:
        return list(value)
    except TypeError:
        return [value]


def read_ocr_results(results):
    """Read recognized text and scores from PaddleOCR 3.x result objects."""
    all_texts = []
    all_scores = []

    if results is None:
        return all_texts, all_scores

    if isinstance(results, (dict, str)):
        results = [results]

    for result in results:
        if isinstance(result, dict):
            result_data = result
        else:
            result_data = getattr(result, "json", None)

            if callable(result_data):
                result_data = result_data()

        if isinstance(result_data, str):
            result_data = json.loads(result_data)

        if not isinstance(result_data, dict):
            logger.warning(
                "OCR DEBUG: unexpected PaddleOCR result type: %s",
                type(result_data).__name__
            )
            continue

        nested_result = result_data.get("res")
        if isinstance(nested_result, dict):
            result_data = nested_result

        texts = _as_list(result_data.get("rec_texts"))
        scores = _as_list(result_data.get("rec_scores"))

        for text in texts:
            cleaned_text = str(text).strip()
            if cleaned_text:
                all_texts.append(cleaned_text)

        for score in scores:
            try:
                all_scores.append(float(score))
            except (TypeError, ValueError):
                continue

    return all_texts, all_scores


def perform_ocr(file_path, extension):
    engine = get_ocr_engine()

    all_texts = []
    all_scores = []
    pages_processed = 0

    if extension == ".pdf":
        with tempfile.TemporaryDirectory() as temp_dir:
            pdf = pdfium.PdfDocument(str(file_path))

            try:
                page_count = len(pdf)

                if page_count == 0:
                    raise ValueError("PDF contains no pages")

                if page_count > 10:
                    raise ValueError("PDF cannot contain more than 10 pages")

                for page_number in range(page_count):
                    page = pdf[page_number]
                    bitmap = None

                    try:
                        bitmap = page.render(scale=2)
                        image = bitmap.to_pil()
                        image_path = Path(temp_dir) / f"page_{page_number}.png"

                        try:
                            image.save(image_path)
                        finally:
                            image.close()

                        logger.info(
                            "OCR DEBUG: prediction started for PDF page %d/%d",
                            page_number + 1,
                            page_count
                        )
                        started = perf_counter()

                        results = engine.predict(input=str(image_path))

                        logger.info(
                            "OCR DEBUG: prediction returned for PDF page %d "
                            "in %.1f seconds",
                            page_number + 1,
                            perf_counter() - started
                        )

                        texts, scores = read_ocr_results(results)

                        logger.info(
                            "OCR DEBUG: PDF page %d produced %d text regions",
                            page_number + 1,
                            len(texts)
                        )

                        all_texts.extend(texts)
                        all_scores.extend(scores)
                        pages_processed += 1

                    finally:
                        if bitmap is not None:
                            close_bitmap = getattr(bitmap, "close", None)
                            if callable(close_bitmap):
                                close_bitmap()

                        page.close()

            finally:
                pdf.close()

    else:
        logger.info(
            "OCR DEBUG: prediction started for image %s",
            Path(file_path).name
        )
        started = perf_counter()

        results = engine.predict(input=str(file_path))

        logger.info(
            "OCR DEBUG: prediction returned for image in %.1f seconds",
            perf_counter() - started
        )

        all_texts, all_scores = read_ocr_results(results)

        logger.info(
            "OCR DEBUG: image produced %d text regions",
            len(all_texts)
        )

        pages_processed = 1

    return all_texts, all_scores, pages_processed


def perform_ocr_serialized(file_path, extension):
    """Avoid concurrent predictions using the same PaddleOCR engine."""
    with _ocr_predict_lock:
        return perform_ocr(file_path, extension)


def parse_number(value):
    if value is None or value == "":
        return None

    cleaned = str(value).replace(",", "")
    cleaned = re.sub(r"[^0-9.]", "", cleaned)

    if not cleaned:
        return None

    try:
        number = float(cleaned)
        return int(number) if number.is_integer() else number
    except ValueError:
        return None


def parse_invoice(texts, scores):
    full_text = "\n".join(texts)

    invoice_number = None
    match = re.search(
        r"Invoice\s*(?:No\.?|Number|#)\s*:?\s*([A-Z0-9/-]+)",
        full_text,
        re.IGNORECASE
    )
    if match:
        invoice_number = match.group(1)

    invoice_date = None
    match = re.search(
        r"(?:Invoice\s*)?Date\s*:?\s*(\d{1,4}[-/]\d{1,2}[-/]\d{2,4})",
        full_text,
        re.IGNORECASE
    )
    if match:
        invoice_date = match.group(1)

    # Only use explicitly labelled supplier/customer text;
    # don't guess these values from an unrelated OCR line.
    supplier = None
    match = re.search(
        r"(?:Supplier|Vendor|From)\s*:?\s*([^\n]+)",
        full_text,
        re.IGNORECASE
    )
    if match:
        supplier = match.group(1).strip()

    customer = None
    match = re.search(
        r"(?:Bill\s*To|Customer)\s*:?\s*([^\n]+)",
        full_text,
        re.IGNORECASE
    )
    if match:
        customer = match.group(1).strip()

    invoice_type = None
    match = re.search(
        r"Invoice\s*Type\s*:?\s*(Purchase|Sales)",
        full_text,
        re.IGNORECASE
    )
    if match:
        invoice_type = match.group(1).lower()

    subtotal = None
    match = re.search(
        r"Subtotal[^\d\n]*([\d,]+(?:\.\d{1,2})?)",
        full_text,
        re.IGNORECASE
    )
    if match:
        subtotal = parse_number(match.group(1))

    gst = None
    match = re.search(
        r"GST(?:\s*\([^)]*\))?[^\d\n]*([\d,]+(?:\.\d{1,2})?)",
        full_text,
        re.IGNORECASE
    )
    if match:
        gst = parse_number(match.group(1))

    grand_total = None
    match = re.search(
        r"Grand\s*Total[^\d\n]*([\d,]+(?:\.\d{1,2})?)",
        full_text,
        re.IGNORECASE
    )
    if match:
        grand_total = parse_number(match.group(1))

    payment_status = None
    match = re.search(
        r"Payment\s*Status\s*:?\s*(Paid|Unpaid|Pending)",
        full_text,
        re.IGNORECASE
    )
    if match:
        payment_status = match.group(1).lower()

    items = []
    header_end = -1

    for index, line in enumerate(texts):
        if re.search(r"\bamount\b", line.strip(), re.IGNORECASE):
            header_end = index
            break

    if header_end != -1:
        index = header_end + 1

        while index + 4 < len(texts):
            line = texts[index].strip()

            if re.search(r"subtotal|grand total|gst", line, re.IGNORECASE):
                break

            # This parser only creates an item when OCR returns all
            # five expected pieces: row number, name, quantity,
            # unit price, and amount.
            if re.fullmatch(r"\d+\.?", line):
                description = texts[index + 1].strip()
                quantity = parse_number(texts[index + 2])
                unit_price = parse_number(texts[index + 3])
                amount = parse_number(texts[index + 4])

                if (
                    description
                    and quantity is not None
                    and unit_price is not None
                    and amount is not None
                ):
                    items.append({
                        "name": description,
                        "quantity": quantity,
                        "unit_price": unit_price,
                        "amount": amount
                    })

                    index += 5
                    continue

            index += 1

    confidence = (
        round(sum(scores) / len(scores), 2)
        if scores else None
    )

    return {
        "invoice_number": invoice_number,
        "invoice_date": invoice_date,
        "invoice_type": invoice_type,
        "supplier": supplier,
        "customer": customer,
        "items": items,
        "subtotal": subtotal,
        "gst": gst,
        "grand_total": grand_total,
        "payment_status": payment_status,
        "confidence": confidence
    }


@app.get("/")
def home():
    return {
        "message": "Welcome to DhanDhristi OCR Service",
        "status": "Running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "OCR Service"
    }


@app.post("/api/invoices/upload")
async def upload_invoice(
    invoice: UploadFile = File(...),
    invoice_type: str = Form(...)
):
    request_id = uuid4().hex[:8]
    invoice_type = invoice_type.strip().lower()

    if invoice_type not in ["purchase", "sales"]:
        raise HTTPException(
            status_code=400,
            detail="Invoice type must be purchase or sales"
        )

    extension = Path(invoice.filename or "").suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG, PNG and PDF files are allowed"
        )

    content = await invoice.read(MAX_FILE_SIZE + 1)

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size must not exceed 10 MB"
        )

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty"
        )

    if extension in [".jpg", ".jpeg"]:
        valid_file = content.startswith(b"\xff\xd8\xff")
    elif extension == ".png":
        valid_file = content.startswith(b"\x89PNG\r\n\x1a\n")
    else:
        valid_file = content.startswith(b"%PDF-")

    if not valid_file:
        raise HTTPException(
            status_code=400,
            detail="File content does not match its extension"
        )

    saved_filename = f"{uuid4().hex}{extension}"
    file_path = UPLOAD_DIR / saved_filename

    try:
        file_path.write_bytes(content)

        logger.info(
            "OCR DEBUG [%s]: accepted %s (%d bytes, type=%s)",
            request_id,
            invoice.filename,
            len(content),
            invoice_type
        )

        logger.info("OCR DEBUG [%s]: sending OCR work to thread pool", request_id)

        texts, scores, pages_processed = await run_in_threadpool(
            perform_ocr_serialized,
            file_path,
            extension
        )

        logger.info(
            "OCR DEBUG [%s]: OCR finished; pages=%d, text regions=%d",
            request_id,
            pages_processed,
            len(texts)
        )

        if not texts:
            raise HTTPException(
                status_code=422,
                detail="No readable text found in invoice"
            )

        invoice_data = parse_invoice(texts, scores)

        # This comes from the user's form selection, not an OCR guess.
        invoice_data["invoice_type"] = invoice_type

        return {
            "status": "success",
            "message": "Invoice uploaded and processed successfully",
            "ocr_status": "completed",
            "original_filename": invoice.filename,
            "saved_filename": saved_filename,
            "file_format": extension,
            "file_size": len(content),
            "invoice_type": invoice_type,
            "pages_processed": pages_processed,
            "extracted_data": invoice_data,
            "raw_text": texts
        }

    except HTTPException:
        raise

    except Exception as error:
        logger.exception("OCR DEBUG [%s]: processing failed", request_id)
        raise HTTPException(
            status_code=500,
            detail=f"OCR processing failed: {str(error)}"
        )