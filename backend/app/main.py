"""
Main FastAPI Application Entry Point for SIH Material Standardization Engine.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.config.settings import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for Next.js and frontend consumers
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(router, prefix=settings.API_PREFIX)


@app.get("/", summary="Root Welcome Endpoint", tags=["System"])
async def root():
    return JSONResponse(
        content={
            "project": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "phase": "Data Ingestion & Text Preprocessing",
            "documentation": "/docs",
            "endpoints": {
                "health": "/health",
                "process_material": "/process/material",
                "process_csv": "/process/csv",
                "abbreviations": "/abbreviations",
                "units": "/units",
            },
        }
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
