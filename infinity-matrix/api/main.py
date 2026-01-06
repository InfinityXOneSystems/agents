from fastapi import FastAPI
from api.routes import router

app = FastAPI(title="Infinity Matrix API Gateway")
app.include_router(router)
