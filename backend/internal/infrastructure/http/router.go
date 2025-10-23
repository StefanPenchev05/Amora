package http

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

// ChiRouter
type ChiRouter struct {
	mux         chi.Router
	middlewares []Middleware
}

func NewRouter(middlewares ...Middleware) Router {
	r := chi.NewRouter()

	// Essential build-in middlewares
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	return &ChiRouter{
		mux:         r,
		middlewares: middlewares,
	}
}

func (cr *ChiRouter) Handler() http.Handler {
	for _, mw := range cr.middlewares {
		cr.mux.Use(mw.Handle)
	}
	return cr.mux
}

func (cr *ChiRouter) RegisterRoutes(groups ...RouteGroup) {
	for _, group := range groups {
		group.RegisterRoutes(cr)
	}
}

func (cr *ChiRouter) Mount(path string, handler http.Handler) {
	cr.mux.Mount(path, handler)
}

func (cr *ChiRouter) Route(pattern string, fn func(chi.Router)) {
	cr.mux.Route(pattern, fn)
}
