package container

import (
	"github.com/StefanPenchev05/Amora/backend/internal/application/interfaces"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/services"
)

// ========================================================
// Authentication an Authorization Services
// ========================================================

func (c *Container) GetJWTService() interfaces.JWTService {
	if c.jwtService == nil {
		jwtConfig := c.config.JWT
		c.jwtService = services.NewJWTService(
			jwtConfig.AccessSecret,
			jwtConfig.RefreshSecret,
			jwtConfig.AccessTTL,
			jwtConfig.RefreshTTL,
			jwtConfig.Issuer,
			jwtConfig.Audience,
		)
		c.logger.Info("JWT service initialized")
	}

	return c.jwtService
}
