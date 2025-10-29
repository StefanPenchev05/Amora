package user

import (
	"context"
	"errors"
	"fmt"

	dto "github.com/StefanPenchev05/Amora/backend/internal/application/dto/user"
	"github.com/StefanPenchev05/Amora/backend/internal/application/interfaces"
	"github.com/StefanPenchev05/Amora/backend/internal/domain/user"
)

type AuthenticateUserCase struct {
	userRepo       user.Repository
	userService    *user.UserService
	jwtService     interfaces.JWTService
	eventPublisher interfaces.EventPublisher
}

func NewAuthenticateUserCase(
	userRepo user.Repository,
	userService *user.UserService,
	jwtService interfaces.JWTService,
	eventPublisher interfaces.EventPublisher,
) *AuthenticateUserCase {
	return &AuthenticateUserCase{
		userRepo:       userRepo,
		userService:    userService,
		jwtService:     jwtService,
		eventPublisher: eventPublisher,
	}
}

func (uc *AuthenticateUserCase) Execute(ctx context.Context, req dto.AuthenticateUserRequest) (*dto.AuthenticateUserResponse, error) {
	// Find the user by email or username, if not found return error
	foundUser, err := uc.findUserByEmailOrUsername(ctx, req.EmailOrUsername)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Verify password
	if !foundUser.Credentials.PasswordHash.Verify(req.Password) {
		return nil, errors.New("invalid credentials")
	}

	// Record Login
	foundUser.RecordLogin(req.IPAddress, req.UserAgent)
	if err := uc.userRepo.Update(ctx, foundUser); err != nil {
		// TODO: Add logger for errors
	}

	// Generate JWT token
	accessToken, err := uc.jwtService.GenerateAccessToken(foundUser.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token %w", err)
	}

	refreshToken, err := uc.jwtService.GenerateRefreshToken(foundUser.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	//

	// Domain Events
	events := foundUser.GetEvents()
	if len(events) > 0 {
		if err := uc.eventPublisher.PublishEvents(ctx, events...); err != nil {
			// TODO: Add proper logging
			// Don't fail authentication if event publishing fails
		}
	}
	foundUser.ClearEvents()

	userProfile := dto.NewUserProfile(foundUser)
	bootstrap := dto.NewAuthBootstrap(foundUser)

	// Return the response
	return &dto.AuthenticateUserResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		TokenType:    "Bareer",
		ExpiresAt:    900, // 15 minutes
		User:         userProfile,
		Bootstrap:    bootstrap,
	}, nil
}

func (uc *AuthenticateUserCase) findUserByEmailOrUsername(ctx context.Context, emailOrUsername string) (*user.User, error) {
	// Try to find by email
	if email, emailErr := user.NewEmail(emailOrUsername); emailErr == nil {
		if foundUser, err := uc.userRepo.GetByEmail(ctx, email); err != nil {
			return foundUser, nil
		}
	}

	// If not found by email, try the username
	if username, usernameErr := user.NewUsername(emailOrUsername); usernameErr == nil {
		if foundUser, err := uc.userRepo.GetByUsername(ctx, username); err != nil {
			return foundUser, nil
		}
	}

	return nil, errors.New("user not found")
}
