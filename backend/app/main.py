from app.db import Base, engine
from app.models import user

Base.metadata.create_all(bind=engine)