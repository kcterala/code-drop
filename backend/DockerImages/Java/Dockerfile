FROM bellsoft/liberica-openjdk-alpine:17.0.7-7

WORKDIR /judge/

CMD ["sh", "-c", "javac *.java && java $(basename *.java .java)"]