import os
import sys

# Ensure api directory is on sys.path
api_dir = os.path.join(os.path.dirname(__file__), "api")
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

from api.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

