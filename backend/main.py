import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.config import settings
from backend.database.db import engine, Base
from backend.routes.student_routes import router as student_router

# Auto-create tables on startup (as a backup if migrations aren't executed manually)
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables verified/created successfully.")
except Exception as e:
    print(f"Warning: Could not auto-create tables on startup: {e}")
    print("Please ensure your database exists and credentials are correct in .env")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Student Information Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS to allow frontend connections
# We allow localhost frontend Vite port (usually 5173, but we allow wildcard/defaults to be safe for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(student_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "docs": "/docs"
    }

# Global exception handler for clean frontend error logging
@app.exception_handler(Exception)
def global_exception_handler(request: Request, exc: Exception):
    # Log the exception stack in a real app
    print(f"Global Exception Handler: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"An internal server error occurred: {str(exc)}"}
    )

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
