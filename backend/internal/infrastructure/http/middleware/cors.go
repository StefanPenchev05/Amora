package middleware

import (
	"net/http"

	httpApp "github.com/StefanPenchev05/Amora/backend/internal/infrastructure/http"
	"github.com/go-chi/cors"
)

type CORSMiddleware struct {
	handler func(http.Handler) http.Handler
}

func NewCORSMiddleware(allowedOrigins []string) httpApp.Middleware {
	corsHandler := cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	})

	return &CORSMiddleware{
		handler: corsHandler,
	}
}

func (cm *CORSMiddleware) Handle(next http.Handler) http.Handler {
	return cm.handler(next)
}
