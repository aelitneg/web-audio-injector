FROM python:3.9

RUN pip install wave websockets

WORKDIR /app

COPY ./src .

ENV PYTHONASYNCIODEBUG=1

CMD ["python", "./app.py"]
