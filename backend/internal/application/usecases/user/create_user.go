package user

import (
	"context"
	"fmt"

	dto "github.com/StefanPenchev05/Amora/backend/internal/application/dto/user"
	"github.com/StefanPenchev05/Amora/backend/internal/application/interfaces"
	"github.com/StefanPenchev05/Amora/backend/internal/domain/user"
)

type CreateUserCase struct {
	userRepo       user.Repository
	userService    *user.UserService
	eventPublisher interfaces.EventPublisher
}

func NewCreateUserCase(
	userRepo user.Repository,
	userService user.UserService,
	eventPublisher interfaces.EventPublisher,
) *CreateUserCase {
	return &CreateUserCase{
		userRepo:       userRepo,
		userService:    &userService,
		eventPublisher: eventPublisher,
	}
}

func (uc *CreateUserCase) Execute(ctx context.Context, req dto.CreateUserRequest) (*dto.CreateUserResponse, error) {
	if err := uc.userService.ValidateUserForCreation(ctx, req.Email, req.Username); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	newUser, err := user.NewUser(req.Email, req.Username, req.FirstName, req.LastName)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	if err := uc.userRepo.Create(ctx, newUser); err != nil {
		return nil, fmt.Errorf("failed to save user: %w", err)
	}

	events := newUser.GetEvents()
	if err := uc.eventPublisher.PublishEvents(ctx, events...); err != nil {
		fmt.Errorf("failed to register the event: %w", err)
	}

	newUser.ClearEvents()

	return &dto.CreateUserResponse{
		ID:        newUser.ID,
		Email:     newUser.Credentials.Email.String(),
		Username:  newUser.Credentials.Username.String(),
		FirstName: newUser.Profile.FirstName,
		LastName:  newUser.Profile.LastName,
		CreatedAt: newUser.CreatedAt.Format("2006-01-02T15:04:05Z"),
	}, nil
}
