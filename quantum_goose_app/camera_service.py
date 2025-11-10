"""Camera streaming utilities for quantum_goose_app."""
import time
import logging
from contextlib import contextmanager

try:
    import cv2
except ImportError:  # pragma: no cover
    cv2 = None

logger = logging.getLogger(__name__)


class CameraUnavailableError(RuntimeError):
    """Raised when the camera cannot be accessed."""


def camera_ready(device_index: int = 0) -> bool:
    """Check if camera is available and ready."""
    if cv2 is None:
        logger.warning("OpenCV not available")
        return False
    
    try:
        capture = cv2.VideoCapture(device_index)
        if not capture.isOpened():
            capture.release()
            logger.warning(f"Camera device {device_index} not opened")
            return False
        
        # Try to read a test frame
        ret, frame = capture.read()
        capture.release()
        
        if not ret or frame is None:
            logger.warning("Failed to read test frame from camera")
            return False
            
        return True
    except Exception as e:
        logger.error(f"Error checking camera readiness: {e}")
        return False


@contextmanager
def open_camera(device_index: int = 0):
    """Context manager for safely opening and closing camera."""
    if cv2 is None:
        raise CameraUnavailableError("OpenCV is not installed")
    
    capture = cv2.VideoCapture(device_index)
    try:
        # Set camera properties for better performance
        capture.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        capture.set(cv2.CAP_PROP_FPS, 30)
        capture.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        
        if not capture.isOpened():
            raise CameraUnavailableError("Unable to access camera device")
        
        yield capture
    finally:
        capture.release()


def frame_generator(device_index: int = 0):
    """Generate MJPEG frames from camera."""
    retry_count = 0
    max_retries = 3
    
    while retry_count < max_retries:
        try:
            with open_camera(device_index) as capture:
                retry_count = 0  # Reset retry count on successful connection
                
                while True:
                    ret, frame = capture.read()
                    if not ret:
                        logger.warning("Failed to read frame from camera")
                        break
                    
                    # Add timestamp overlay
                    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
                    cv2.putText(frame, timestamp, (10, 30), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                    
                    # Encode frame to JPEG
                    ret, buffer = cv2.imencode('.jpg', frame, 
                                              [cv2.IMWRITE_JPEG_QUALITY, 85])
                    if not ret:
                        logger.warning("Failed to encode frame")
                        continue
                    
                    yield (b"--frame\r\n"
                           b"Content-Type: image/jpeg\r\n\r\n" + 
                           buffer.tobytes() + b"\r\n")
                           
        except CameraUnavailableError as e:
            logger.error(f"Camera error: {e}")
            retry_count += 1
            if retry_count >= max_retries:
                raise
            time.sleep(2 ** retry_count)  # Exponential backoff
        except Exception as e:
            logger.error(f"Unexpected error in frame generator: {e}")
            retry_count += 1
            if retry_count >= max_retries:
                raise CameraUnavailableError(f"Camera failed after {max_retries} retries")
            time.sleep(1)


def generate_placeholder_frame():
    """Generate a placeholder frame when camera is unavailable."""
    if cv2 is None:
        # Return a simple SVG placeholder as bytes
        svg_placeholder = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
    <rect width="640" height="480" fill="#1a1a1a"/>
    <text x="320" y="240" font-family="Arial, sans-serif" font-size="24" 
          fill="#ffffff" text-anchor="middle">Camera Unavailable</text>
    <text x="320" y="270" font-family="Arial, sans-serif" font-size="16" 
          fill="#888888" text-anchor="middle">Install OpenCV to enable camera</text>
</svg>'''
        return svg_placeholder.encode('utf-8')
        
    try:
        import numpy as np
        
        # Create a dark placeholder frame
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        
        # Add text
        text = "Camera Unavailable"
        cv2.putText(frame, text, (150, 240), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        ret, buffer = cv2.imencode('.jpg', frame)
        if ret:
            return buffer.tobytes()
    except Exception as e:
        logger.error(f"Error generating placeholder frame: {e}")
    
    return None
