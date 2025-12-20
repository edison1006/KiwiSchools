from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import kindergartens, schools, zones

app = FastAPI(
    title="KiwiSchools API",
    description="API for exploring schools across New Zealand",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(schools.router)
app.include_router(kindergartens.router)
app.include_router(zones.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
