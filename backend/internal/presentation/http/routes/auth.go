package routes

import (
	httpInfra "github.com/StefanPenchev05/Amora/backend/internal/infrastructure/http"
	"github.com/StefanPenchev05/Amora/backend/internal/presentation/http/handlers"
	"github.com/go-chi/chi/v5"
)

// AuthRoutes handles authentication-related routes
type AuthRoutes struct {
	authHandler *handlers.AuthHandler
}

func NewAuthRoutes(authHandler *handlers.AuthHandler) *AuthRoutes {
	return &AuthRoutes{
		authHandler: authHandler,
	}
}

func (a *AuthRoutes) Path() string {
	return "/auth"
}

func (a *AuthRoutes) RegisterRoutes(router httpInfra.Router) {
	router.Route(a.Path(), func(r chi.Router) {
		r.Post("/register", a.authHandler.Register)
		r.Post("/login", a.authHandler.Login)
		r.Post("/refresh", a.authHandler.RefreshToken)
		// r.Post("/logout", a.authHandler.Logout)        // TODO
	})
}
