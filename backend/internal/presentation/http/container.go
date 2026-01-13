package http

import (
	"log/slog"

	"github.com/StefanPenchev05/Amora/backend/internal/config"
	"github.com/StefanPenchev05/Amora/backend/internal/container"
	httpInfra "github.com/StefanPenchev05/Amora/backend/internal/infrastructure/http"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/http/middleware"
	"github.com/StefanPenchev05/Amora/backend/internal/presentation/http/handlers"
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

	// Register auth routes
	authHandler := c.buildAuthHandler()
	authRoutes := routes.NewAuthRoutes(authHandler)
	router.RegisterRoutes(authRoutes)
	
	// Register app routes (events, moods, notes, memories, expenses)
	appRoutes := c.buildAppRoutes()
	router.RegisterRoutes(appRoutes)
}

func (c *HTTPContainer) buildAuthHandler() *handlers.AuthHandler {
	return handlers.NewAuthHandler(c.dependecyContainer, c.logger)
}

func (c *HTTPContainer) buildAppRoutes() *routes.AppRoutes {
	// Get DB connection from container
	db := c.dependecyContainer.GetDB()
	jwtService := c.dependecyContainer.GetJWTService()
	
	// Build handlers
	eventHandler := handlers.NewEventHandler(db, c.logger)
	moodHandler := handlers.NewMoodHandler(db, c.logger)
	noteHandler := handlers.NewNoteHandler(db, c.logger)
	memoryHandler := handlers.NewMemoryHandler(db, c.logger)
	expenseHandler := handlers.NewExpenseHandler(db, c.logger)
	authMiddleware := middleware.NewAuthMiddleware(jwtService)
	
	return routes.NewAppRoutes(eventHandler, moodHandler, noteHandler, memoryHandler, expenseHandler, authMiddleware)
}
