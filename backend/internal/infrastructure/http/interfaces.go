package http

import (
	"context"
	"net/http"

	"github.com/go-chi/chi/v5"
)

// Server interface - resposibility
type HTTPServer interface {
	Start() error
	Shutdown(ctx context.Context) error
}

// Router interface
type Router interface {
	Handler() http.Handler
	RegisterRoutes(routeGroupe ...RouteGroup)
	Mount(path string, handler http.Handler)
	Route(pattern string, fn func(chi.Router))
}

// Route group interface which allows extending routes
type RouteGroup interface {
	RegisterRoutes(router Router)
	Path() string
}

type Middleware interface {
	Handle(next http.Handler) http.Handler
}
