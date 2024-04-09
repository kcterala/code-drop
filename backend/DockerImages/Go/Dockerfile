FROM golang:alpine
ENV GOOS=linux
ENV GO111MODULE=on
ENV GOARCH=amd64
WORKDIR /judge/

CMD ["sh", "-c", "go build code.go && ./code"]
