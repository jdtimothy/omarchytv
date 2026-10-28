FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && rm -rf /root/.cache/pip
COPY --chown=1000:1000 --chmod=0444 homewatch.py .

USER 1000:1000
ENTRYPOINT ["python", "/app/homewatch.py"]
