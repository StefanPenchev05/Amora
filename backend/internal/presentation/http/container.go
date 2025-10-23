package http

import (
	"github.com/StefanPenchev05/Amora/backend/internal/config"
	httpInfra "github.com/StefanPenchev05/Amora/backend/internal/infrastructure/http"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/http/middleware"
)

// Presentaion layer
type Container struct {
	config *config.Config
}

func NewContainer(cfg *config.Config) *Container {
	return &Container{cfg}
}

func (c *Container) BuildServer() httpInfra.HTTPServer {
	// Build infrastructure components
}

func (c *Container) buildRouter() httpInfra.Router {
	// Build middleware
	corsMiddleware := middleware.NewCORSMiddleware([]string{
		"http://localhost:3000",
	})

	// Build router with middleware
	router := httpInfra.NewRouter(corsMiddleware)
}
