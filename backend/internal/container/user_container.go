package container

import (
	userUseCase "github.com/StefanPenchev05/Amora/backend/internal/application/usecases/user"
	"github.com/StefanPenchev05/Amora/backend/internal/domain/user"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql"
)

func (c *Container) GetUserRepository() user.Repository {
	if c.userRepository == nil {
		c.userRepository = mysql.NewUserRepository(c.db)
		c.logger.Info("User repository initialized")
	}

	return c.userRepository
}

func (c *Container) GetUserService() *user.UserService {
	if c.userService == nil {
		c.userService = user.NewUserService(c.userRepository)
		c.logger.Info("User service initialized")
	}

	return c.userService
}

func (c *Container) GetCreateUserUseCase() *userUseCase.CreateUserCase {
	return userUseCase.NewCreateUserCase(
		c.GetUserRepository(),
		c.GetUserService(),
		c.eventPublisher,
		c.logger,
	)
}

func (c *Container) GetAuthenticateUserUseCase() *userUseCase.AuthenticateUserCase {
	return userUseCase.NewAuthenticateUserCase(
		c.GetUserRepository(),
		c.GetUserService(),
		c.GetJWTService(),
		c.eventPublisher,
		c.logger,
	)
}
