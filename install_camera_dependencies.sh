#!/bin/bash
# Install camera dependencies for Quantum Camera Stream Service

echo "=== Installing Camera Dependencies ==="

# Check if we're in a virtual environment
if [[ "$VIRTUAL_ENV" != "" ]]; then
    echo "Virtual environment detected: $VIRTUAL_ENV"
    PIP_CMD="pip"
else
    echo "No virtual environment detected, using system pip"
    PIP_CMD="pip3"
fi

# Install OpenCV
echo "Installing OpenCV..."
$PIP_CMD install opencv-python==4.10.0.84

# Install numpy (required by OpenCV)
echo "Installing numpy..."
$PIP_CMD install numpy

# Test installation
echo "Testing OpenCV installation..."
python3 -c "
import cv2
print(f'OpenCV version: {cv2.__version__}')
print('Camera dependencies installed successfully!')
" 2>/dev/null || echo "OpenCV installation failed"

echo "=== Installation Complete ==="