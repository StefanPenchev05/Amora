# ------- Build Stage -------
ARG code_version=1.24.7-alpine3.22
FROM golang:${code_version} AS builder

# Set the working directory
WORKDIR /app

# Copy go.mod and go.sum first(for dependency first)
COPY go.mod go.sum /app/
RUN ["go", "mod", "download"]

# Copy the rest of the source code
COPY . /app/

# Build the go binary
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o server ./cmd/app

# ------- Run Time -------
FROM gcr.io/distroless/static-debian12:nonroot

# Copy only the binary file from the builder
COPY --from=builder /app/server /server

# Expose the port 8080
EXPOSE 8080

ENTRYPOINT [ "/server" ]
