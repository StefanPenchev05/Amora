package user

import (
	"context"
	"errors"
	"fmt"
	"log/slog"

	dto "github.com/StefanPenchev05/Amora/backend/internal/application/dto/user"
	"github.com/StefanPenchev05/Amora/backend/internal/application/interfaces"
	"github.com/StefanPenchev05/Amora/backend/internal/domain/user"
)

type AuthenticateUserCase struct {
	userRepo       user.Repository
	userService    *user.UserService
	jwtService     interfaces.JWTService
	eventPublisher interfaces.EventPublisher
	logger         *slog.Logger
}

func NewAuthenticateUserCase(
	userRepo user.Repository,
	userService *user.UserService,
	jwtService interfaces.JWTService,
	eventPublisher interfaces.EventPublisher,
	logger *slog.Logger,
) *AuthenticateUserCase {
	return &AuthenticateUserCase{
		userRepo:       userRepo,
		userService:    userService,
		jwtService:     jwtService,
		eventPublisher: eventPublisher,
		logger:         logger,
	}
}

func (uc *AuthenticateUserCase) Execute(ctx context.Context, req dto.AuthenticateUserRequest) (*dto.AuthenticateUserResponse, error) {
	// Find the user by email or username, if not found return error
	foundUser, err := uc.findUserByEmailOrUsername(ctx, req.EmailOrUsername)
	if err != nil {
		uc.logger.Warn("Authentication failed - user not found",
			"email_or_username", req.EmailOrUsername,
			"ip_address", req.IPAddress,
		)
		return nil, errors.New("invalid credentials")
	}

	// Verify password
	if !foundUser.Credentials.PasswordHash.Verify(req.Password) {
		uc.logger.Warn("Authentication failed - invalid password",
			"user_id", foundUser.ID,
			"email", foundUser.Credentials.Email.String(),
			"ip_address", req.IPAddress,
		)
		return nil, errors.New("invalid credentials")
	}

	// Record Login
	foundUser.RecordLogin(req.IPAddress, req.UserAgent)
	if err := uc.userRepo.Update(ctx, foundUser); err != nil {
		uc.logger.Error("Failed to update user login record",
			"user_id", foundUser.ID,
			"error", err.Error(),
		)
	}

	// Generate JWT tokens
	accessToken, err := uc.jwtService.GenerateAccessToken(foundUser.ID)
	if err != nil {
		uc.logger.Error("Failed to generate access token",
			"user_id", foundUser.ID,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := uc.jwtService.GenerateRefreshToken(foundUser.ID)
	if err != nil {
		uc.logger.Error("Failed to generate refresh token",
			"user_id", foundUser.ID,
			"error", err.Error(),
		)
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	// Handle Domain Events
	events := foundUser.GetEvents()
	if len(events) > 0 {
		if err := uc.eventPublisher.PublishEvents(ctx, events...); err != nil {
			uc.logger.Error("Failed to publish domain events",
				"user_id", foundUser.ID,
				"event_count", len(events),
				"error", err.Error(),
			)
		} else {
			uc.logger.Debug("Successfully published domain events",
				"user_id", foundUser.ID,
				"event_count", len(events),
			)
		}
	}
	foundUser.ClearEvents()

	// Build response
	userProfile := dto.NewUserProfile(foundUser)
	bootstrap := dto.NewAuthBootstrap(foundUser)

	// Get token expiration from JWT service
	expiresIn := uc.jwtService.GetAccessTokenExpiration()

	// Log successful authentication
	uc.logger.Info("User authenticated successfully",
		"user_id", foundUser.ID,
		"email", foundUser.Credentials.Email.String(),
		"ip_address", req.IPAddress,
		"user_agent", req.UserAgent,
	)

	// Return the response
	return &dto.AuthenticateUserResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		TokenType:    "Bearer",       // Fixed typo
		ExpiresIn:    int(expiresIn), // Fixed field name
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
