package http

import (
	"context"
	"net/http"
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
}

// Route group interface which allows extending routes
type RouteGroup interface {
	RegisterRoutes(router Router)
	Path() string
}

type Middleware interface {
	Handle(next http.Handler) http.Handler
}
