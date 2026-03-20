"""
EchoInsight AI — Transcription Service
Local Whisper-based speech-to-text.
"""

import os
import whisper
import tempfile
import numpy as np
import imageio_ffmpeg
import uuid
from app.config import get_settings
from app.utils.logger import logger
import subprocess
import ffmpeg

# IMPORTANT: Whisper uses subprocess.run(["ffmpeg", ...]). 
# On Windows, this often fails if ffmpeg is not properly in the global PATH.
# We monkey patch `whisper.audio.load_audio` to explicitly use our bundled ffmpeg.
_original_load_audio = whisper.audio.load_audio

def _custom_load_audio(file: str, sr: int = 16000):
    """
    Open an audio file and read as mono waveform, resampling as necessary,
    using imageio_ffmpeg's explicit executable path.
    """
    ffmpeg_cmd = imageio_ffmpeg.get_ffmpeg_exe()
    try:
        # This launches a subprocess to decode audio while down-mixing and resampling as necessary.
        # Requires the ffmpeg CLI and `ffmpeg-python` package to be installed.
        out, _ = (
            ffmpeg.input(file, threads=0)
            .output("-", format="s16le", acodec="pcm_s16le", ac=1, ar=sr)
            .run(cmd=ffmpeg_cmd, capture_stdout=True, capture_stderr=True)
        )
    except ffmpeg.Error as e:
        raise RuntimeError(f"Failed to load audio: {e.stderr.decode()}") from e

    return np.frombuffer(out, np.int16).flatten().astype(np.float32) / 32768.0

whisper.audio.load_audio = _custom_load_audio

settings = get_settings()

# ── Load Whisper model once ──────────────────────────────
_whisper_model = None


def _get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        logger.info(f"Loading Whisper model: {settings.WHISPER_MODEL_SIZE}")
        _whisper_model = whisper.load_model(settings.WHISPER_MODEL_SIZE)
        logger.info("Whisper model loaded successfully")
    return _whisper_model


class TranscriptionService:
    """Transcribe audio files using local Whisper."""

    def transcribe(self, audio_bytes: bytes, file_extension: str = "wav") -> dict:
        """
        Transcribe audio bytes to text.

        Returns:
            {
                "text": "full transcript",
                "segments": [ { "start": 0.0, "end": 2.5, "text": "..." }, ... ],
                "language": "en",
                "duration": 123.4
            }
        """
        model = _get_whisper_model()

        # Write audio to a unique temp file
        unique_id = uuid.uuid4()
        tmp_path = os.path.join(tempfile.gettempdir(), f"echo_{unique_id}.{file_extension}")
        try:
            with open(tmp_path, "wb") as f:
                f.write(audio_bytes)

            logger.info(f"Transcribing audio file ({len(audio_bytes)} bytes)…")
            result = model.transcribe(tmp_path, verbose=False)

            segments = [
                {
                    "start": seg["start"],
                    "end": seg["end"],
                    "text": seg["text"].strip(),
                }
                for seg in result.get("segments", [])
            ]

            duration = segments[-1]["end"] if segments else 0.0

            transcript = {
                "text": result.get("text", "").strip(),
                "segments": segments,
                "language": result.get("language", "en"),
                "duration": round(duration, 2),
            }

            logger.info(
                f"Transcription complete: {len(segments)} segments, "
                f"{duration:.1f}s, lang={transcript['language']}"
            )
            return transcript

        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            raise RuntimeError(f"Audio transcription failed: {e}")
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
