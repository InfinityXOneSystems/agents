FROM python:3.10-slim
WORKDIR /app
COPY . /app
RUN pip install fastapi uvicorn prometheus_client
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
