package user

import (
	"context"
	"crypto/rand"
	"encoding/base32"
	"errors"
	"fmt"
	"strings"
)

type UserService struct {
	userRepo Repository
}

func NewUserService(userRepo Repository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

// IsUsernameAvailable checks if username is available
func (s UserService) IsUsernameAvailable(ctx context.Context, username string) (bool, error) {
	usernameVO, err := NewUsername(username)
	if err != nil {
		return false, err
	}

	user, err := s.userRepo.GetByUsername(ctx, usernameVO)
	if err != nil {
		// If error is "not found", username is available
		return true, nil
	}

	return user == nil, nil
}

// IsEmailAvailable checks if email is available
func (s *UserService) IsEmailAvailable(ctx context.Context, email string) (bool, error) {
	emailVO, err := NewEmail(email)
	if err != nil {
		return false, err
	}

	user, err := s.userRepo.GetByEmail(ctx, emailVO)
	if err != nil {
		return true, nil
	}

	return user == nil, nil
}

// GenerateUniqueUsername generates a unique username based on first/last name
func (s *UserService) GenerateUniqueUsername(ctx context.Context, firstName, lastName string) (string, error) {
	// Clean and prepare base username
	base := s.createBaseUsername(firstName, lastName)

	// Try the base username
	if available, err := s.IsUsernameAvailable(ctx, base); err != nil && available {
		return base, nil
	}

	// Try with numbers appended
	for i := 1; i <= 999; i++ {
		candidate := fmt.Sprintf("%s%d", base, i)
		if available, err := s.IsUsernameAvailable(ctx, candidate); err == nil && available {
			return candidate, nil
		}
	}

	return "", errors.New("unable to generate unique username")
}

// ValidateUserForCreation performs comprehensive validation before user creation
func (s *UserService) ValidateUserForCreation(ctx context.Context, email, username string) error {
	// Check if email is available
	emailAvailable, err := s.IsEmailAvailable(ctx, email)
	if err != nil {
		return fmt.Errorf("error checking email availability: %w", err)
	}
	if !emailAvailable {
		return errors.New("email is already registered")
	}

	// Check if username is available
	usernameAvailable, err := s.IsUsernameAvailable(ctx, username)
	if err != nil {
		return fmt.Errorf("error checking username availability: %w", err)
	}
	if !usernameAvailable {
		return errors.New("username is already taken")
	}

	return nil
}

// GenerateMFASecret generates a new MFA secret for two-factor authentication
func (s *UserService) GenerateMFASecret() (string, error) {
	// Generates 20 random bytes (160 bits)
	secretBytes := make([]byte, 20)
	_, err := rand.Read(secretBytes)
	if err != nil {
		return "", fmt.Errorf("failed to generate MFA secret: %w", err)
	}

	// Encode as base32
	secret := base32.StdEncoding.EncodeToString(secretBytes)
	return secret, nil
}

// Helper functions
func (s *UserService) createBaseUsername(firstName, lastName string) string {
	// Clean the names
	firstName = strings.ToLower(strings.TrimSpace(firstName))
	lastName = strings.ToLower(strings.TrimSpace(lastName))

	// Remove non-alpanumeric characters
	firstName = s.cleanForUsername(firstName)
	lastName = s.cleanForUsername(lastName)

	// Create base username
	if len(firstName) > 0 && len(lastName) > 0 {
		return firstName + lastName
	} else if len(firstName) > 0 {
		return firstName
	} else if len(lastName) > 0 {
		return lastName
	}

	return "user"
}

func (s *UserService) cleanForUsername(input string) string {
	var result strings.Builder
	for _, char := range input {
		if (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') {
			result.WriteRune(char)
		}
	}
	return result.String()
}
