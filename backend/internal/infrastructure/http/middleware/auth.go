package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/StefanPenchev05/Amora/backend/internal/application/interfaces"
	httpApp "github.com/StefanPenchev05/Amora/backend/internal/infrastructure/http"
)

type AuthMiddleware struct {
	jwt interfaces.JWTService
}

type errorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

func NewAuthMiddleware(jwt interfaces.JWTService) httpApp.Middleware {
	return &AuthMiddleware{jwt: jwt}
}

func (am *AuthMiddleware) Handle(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow CORS preflight requests.
		if r.Method == http.MethodOptions {
			next.ServeHTTP(w, r)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			writeUnauthorized(w, "Missing Authorization header")
			return
		}

		parts := strings.Fields(authHeader)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			writeUnauthorized(w, "Invalid Authorization header format")
			return
		}

		tokenString := parts[1]
		claims, err := am.jwt.ValidateToken(tokenString)
		if err != nil || claims == nil || claims.UserID == "" {
			writeUnauthorized(w, "Invalid or expired token")
			return
		}

		ctx := context.WithValue(r.Context(), "userID", claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func writeUnauthorized(w http.ResponseWriter, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusUnauthorized)
	_ = json.NewEncoder(w).Encode(errorResponse{Error: "unauthorized", Message: message})
}
