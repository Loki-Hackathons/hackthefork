"""
Vercel serverless function entry point for FastAPI backend.
This file adapts the FastAPI app to work with Vercel's serverless functions.
"""
import sys
import os
from pathlib import Path
from mangum import Mangum

# Get the absolute path to the backend directory
current_dir = Path(__file__).parent
backend_path = current_dir.parent / 'backend'
backend_path_str = str(backend_path.resolve())

# Add backend directory to Python path if not already there
if backend_path_str not in sys.path:
    sys.path.insert(0, backend_path_str)

# Import FastAPI app
from app.main import app

# Wrap FastAPI app with Mangum for AWS Lambda/Vercel compatibility
handler = Mangum(app, lifespan="off")

