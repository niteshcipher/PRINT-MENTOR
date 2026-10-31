import os
import sys
# Ensure app directory is discoverable
sys.path.append(os.path.dirname(__file__))

from app.database import engine, SessionLocal, Base, get_db, init_db

# Auto-create tables on import
init_db()
