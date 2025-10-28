package http

import (
	"github.com/StefanPenchev05/Amora/backend/internal/config"
	httpInfra "github.com/StefanPenchev05/Amora/backend/internal/infrastructure/http"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/http/middleware"
	"github.com/StefanPenchev05/Amora/backend/internal/presentation/http/routes"
)

// Presentaion layer
type Container struct {
	config *config.Config
}

func NewContainer(cfg *config.Config) *Container {
	return &Container{cfg}
}

func (c *Container) BuildServer() httpInfra.HTTPServer {
	// Build router with routes
	router := c.buildRouter()

	// Build server with router
	return httpInfra.NewServer(c.config, router)
}

func (c *Container) buildRouter() httpInfra.Router {
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

func (c *Container) registerRoutes(router httpInfra.Router) {
	// Register health routes
	healthRoutes := routes.NewHealthRoutes()
	router.RegisterRoutes(healthRoutes)
}
