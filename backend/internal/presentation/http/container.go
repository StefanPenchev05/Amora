package http

import (
	"log/slog"

	"github.com/StefanPenchev05/Amora/backend/internal/config"
	"github.com/StefanPenchev05/Amora/backend/internal/container"
	httpInfra "github.com/StefanPenchev05/Amora/backend/internal/infrastructure/http"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/http/middleware"
	"github.com/StefanPenchev05/Amora/backend/internal/presentation/http/routes"
)

// Presentaion layer
type HTTPContainer struct {
	config             *config.Config
	dependecyContainer *container.Container
	logger             *slog.Logger
}

func NewHTTPContainer(cfg *config.Config, appContainer *container.Container, logger *slog.Logger) *HTTPContainer {
	return &HTTPContainer{
		config:             cfg,
		dependecyContainer: appContainer,
		logger:             logger,
	}
}

func (c *HTTPContainer) BuildServer() httpInfra.HTTPServer {
	// Build router with routes
	router := c.buildRouter()

	// Build server with router
	return httpInfra.NewServer(c.config, router)
}

func (c *HTTPContainer) buildRouter() httpInfra.Router {
	// Build middleware
	corsMiddleware := middleware.NewCORSMiddleware([]string{
		"http://localhost:3000",
	})

	// Build router with middleware
	router := httpInfra.NewRouter(corsMiddleware)

	// Register route groups
	c.registerRoutes(router)

	return router
}

func (c *HTTPContainer) registerRoutes(router httpInfra.Router) {
	// Register health routes
	healthRoutes := routes.NewHealthRoutes()
	router.RegisterRoutes(healthRoutes)
}
