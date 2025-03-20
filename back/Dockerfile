# Étape 1 : Construction du binaire
FROM golang:1.24.0-alpine AS builder

WORKDIR /app

RUN apk add --no-cache gcc musl-dev sqlite-dev

COPY go.mod go.sum ./
RUN go mod download

COPY .. .

RUN go build -o main .

FROM alpine:latest

WORKDIR /root/

RUN apk add --no-cache sqlite

COPY --from=builder /app/main .
COPY --from=builder /app/pkg/db/migrations /root/pkg/db/migrations
COPY --from=builder /app/Images /root/Images


EXPOSE 3002

CMD ["./main"]