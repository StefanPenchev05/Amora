package main

import (
	"context"
	"log"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/StefanPenchev05/Amora/backend/internal/config"
	"github.com/StefanPenchev05/Amora/backend/internal/container"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql"
	httpPresentation "github.com/StefanPenchev05/Amora/backend/internal/presentation/http"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Setup logger
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	// Connect to db
	db, err := mysql.NewGormConnection(cfg.Database.DSN)
	if err != nil {
		logger.Error("Failed to connect to database", "error", err)
		log.Printf("Full error: %+v", err)

		os.Exit(1)
	}
	logger.Info("Database connected successfully")

	// Create DI container (business logic dependecies)
	appContainer := container.NewContainer(cfg, db, logger)

	// Create HTTP container (presentaion layer)
	httpContainer := httpPresentation.NewHTTPContainer(cfg, appContainer, logger)
	server := httpContainer.BuildServer()

	// Start server in a goroutine
	go func() {
		log.Printf("Server starting on port %s", cfg.Server.Port)
		if err := server.Start(); err != nil {
			log.Fatal("Server failed to start:", err)
			os.Exit(1)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Server shutting down...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")
}
