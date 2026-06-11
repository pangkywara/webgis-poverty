FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY fuzzy/ fuzzy/
COPY service/ service/
ENV PORT=5001
EXPOSE 5001
CMD ["sh", "-c", "uvicorn service.main:app --host 0.0.0.0 --port ${PORT}"]
