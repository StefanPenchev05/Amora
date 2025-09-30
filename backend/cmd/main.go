package main

import (
	"fmt"
	"net/http"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Hello, GO HTTP server!")
}

func main() {
	http.HandleFunc("/", helloHandler)
	fmt.Println("Server running on port 8000...")
	http.ListenAndServe(":8000", nil)
}
