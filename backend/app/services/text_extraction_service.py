"""
EchoInsight AI — Text Extraction Service
Extracts raw text from uploaded document files (PDF, DOCX, TXT, CSV).
"""

import io
from app.utils.logger import logger

class TextExtractionService:
    def extract_text(self, file_content: bytes, file_name: str) -> str:
        """
        Extract text from a document based on its file extension.
        """
        extension = file_name.split(".")[-1].lower() if "." in file_name else ""
        
        try:
            if extension == "pdf":
                return self._extract_from_pdf(file_content)
            elif extension in ["docx", "doc"]:
                return self._extract_from_docx(file_content)
            elif extension in ["txt", "csv"]:
                return file_content.decode("utf-8", errors="replace")
            else:
                raise ValueError(f"Unsupported document format: {extension}")
                
        except Exception as e:
            logger.error(f"Error extracting text from {file_name}: {e}")
            raise RuntimeError(f"Text extraction failed: {str(e)}")

    def _extract_from_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF using PyMuPDF (fitz)."""
        import fitz
        text = ""
        try:
            # Open PDF from memory
            pdf_document = fitz.open(stream=file_content, filetype="pdf")
            for page_num in range(len(pdf_document)):
                page = pdf_document[page_num]
                text += page.get_text() + "\n"
            pdf_document.close()
            return text.strip()
        except ImportError:
            logger.error("PyMuPDF (fitz) is not installed.")
            raise

    def _extract_from_docx(self, file_content: bytes) -> str:
        """Extract text from DOCX using python-docx."""
        from docx import Document
        try:
            # Load docx from memory
            doc = Document(io.BytesIO(file_content))
            return "\n".join([paragraph.text for paragraph in doc.paragraphs])
        except ImportError:
            logger.error("python-docx is not installed.")
            raise
