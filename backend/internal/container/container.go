package container

import (
	"log/slog"

	"gorm.io/gorm"

	"github.com/StefanPenchev05/Amora/backend/internal/application/interfaces"
	"github.com/StefanPenchev05/Amora/backend/internal/config"
	"github.com/StefanPenchev05/Amora/backend/internal/domain/user"
)

type Container struct {
	// Configuration
	config *config.Config

	// Infrastructor
	db     *gorm.DB
	logger *slog.Logger

	// Services
	jwtService     interfaces.JWTService
	eventPublisher interfaces.EventPublisher

	// Repositories
	userRepository user.Repository

	// Services
	userService *user.UserService
}

// Creates a new dependecy
func NewContainer(cfg *config.Config, db *gorm.DB, logger *slog.Logger) *Container {
	return &Container{
		config: cfg,
		db:     db,
		logger: logger,
	}
}

// GetLogger returns the logger instance
func (c *Container) GetLogger() *slog.Logger {
	return c.logger
}

// GetDB returns the db instance
func (c *Container) GetDB() *gorm.DB {
	return c.db
}

// GetDB returns the config instance
func (c *Container) GetConfig() *config.Config {
	return c.config
}
