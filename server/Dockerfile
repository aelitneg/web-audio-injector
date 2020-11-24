FROM python:3.9

RUN pip install wave websockets

WORKDIR /app

COPY ./src .

CMD ["python", "./app.py"]
