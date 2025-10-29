package user

import (
	"context"
	"fmt"
	"log/slog"

	dto "github.com/StefanPenchev05/Amora/backend/internal/application/dto/user"
	"github.com/StefanPenchev05/Amora/backend/internal/application/interfaces"
	"github.com/StefanPenchev05/Amora/backend/internal/domain/user"
)

type CreateUserCase struct {
	userRepo       user.Repository
	userService    *user.UserService
	eventPublisher interfaces.EventPublisher
	logger         *slog.Logger
}

func NewCreateUserCase(
	userRepo user.Repository,
	userService *user.UserService,
	eventPublisher interfaces.EventPublisher,
	logger *slog.Logger,
) *CreateUserCase {
	return &CreateUserCase{
		userRepo:       userRepo,
		userService:    userService,
		eventPublisher: eventPublisher,
		logger:         logger,
	}
}

func (uc *CreateUserCase) Execute(ctx context.Context, req dto.CreateUserRequest) (*dto.CreateUserResponse, error) {
	if err := uc.userService.ValidateUserForCreation(ctx, req.Email, req.Username, req.Password); err != nil {
		uc.logger.Warn("User creation validation failed",
			"email", req.Email,
			"username", req.Username,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	newUser, err := user.NewUser(req.Email, req.Username, req.FirstName, req.LastName, req.Password)
	if err != nil {
		uc.logger.Error("Failed to create user entity",
			"email", req.Email,
			"username", req.Username,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	if err := uc.userRepo.Create(ctx, newUser); err != nil {
		uc.logger.Error("Failed to save user to repository",
			"user_id", newUser.ID,
			"email", req.Email,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to save user: %w", err)
	}

	events := newUser.GetEvents()
	if len(events) > 0 {
		if err := uc.eventPublisher.PublishEvents(ctx, events...); err != nil {
			uc.logger.Error("Failed to publish domain events",
				"user_id", newUser.ID,
				"event_count", len(events),
				"error", err.Error(),
			)
		} else {
			uc.logger.Debug("Successfully published domain events",
				"user_id", newUser.ID,
				"event_count", len(events),
			)
		}
	}
	newUser.ClearEvents()

	uc.logger.Info("User created successfully",
		"user_id", newUser.ID,
		"email", newUser.Credentials.Email.String(),
		"username", newUser.Credentials.Username.String(),
	)

	return &dto.CreateUserResponse{
		ID:        newUser.ID,
		Email:     newUser.Credentials.Email.String(),
		Username:  newUser.Credentials.Username.String(),
		FirstName: newUser.Profile.FirstName,
		LastName:  newUser.Profile.LastName,
		CreatedAt: newUser.CreatedAt.Format("2006-01-02T15:04:05Z"),
	}, nil
}
