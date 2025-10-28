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
	if available, err := s.IsUsernameAvailable(ctx, base); err == nil && available {
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

func (s *UserService) CanUserChangeEmail(ctx context.Context, user *User, newEmail string) error {
	// check if new email is different
	if user.Credentials.Email.String() == newEmail {
		return errors.New("new email must be different from the current email")
	}

	// Check if the new email is available
	available, err := s.IsEmailAvailable(ctx, newEmail)
	if err != nil {
		return errors.New("error checking email")
	}

	if !available {
		return errors.New("email is already registered to another account")
	}

	return nil
}

// CanUserChangeUsername checks if user can change their username
func (s *UserService) CanUserChangeUsername(ctx context.Context, user *User, newUsername string) error {
	// Check if new username is different
	if user.Credentials.Username.String() == strings.ToLower(strings.TrimSpace(newUsername)) {
		return errors.New("new username must be different from current username")
	}

	// Check if new username is available
	available, err := s.IsUsernameAvailable(ctx, newUsername)
	if err != nil {
		return fmt.Errorf("error checking username availability: %w", err)
	}
	if !available {
		return errors.New("username is already taken")
	}

	return nil
}

// Helper functions
func (s *UserService) createBaseUsername(firstName, lastName string) string {
	// Clean the names
	firstName = strings.ToLower(strings.TrimSpace(firstName))
	lastName = strings.ToLower(strings.TrimSpace(lastName))

	// Remove non-alphanumeric characters
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

// ValidatePasswordStrength performs additional password strength validation
func (s *UserService) ValidatePasswordStrength(password string) (score int, suggestions []string) {
	score = 0
	suggestions = []string{}

	if len(password) >= 12 {
		score += 2
	} else if len(password) >= 8 {
		score += 1
	} else {
		suggestions = append(suggestions, "Use at least 8 characters")
	}

	// Check character variety
	var hasUpper, hasLower, hasNumber, hasSpecial bool
	for _, char := range password {
		switch {
		case char >= 'A' && char <= 'Z':
			hasUpper = true
		case char >= 'a' && char <= 'z':
			hasLower = true
		case char >= '0' && char <= '9':
			hasNumber = true
		case strings.ContainsRune("!@#$%^&*()_+-=[]{}|;:,.<>?", char):
			hasSpecial = true
		}
	}

	if hasUpper {
		score++
	} else {
		suggestions = append(suggestions, "Include uppercase letters")
	}

	if hasLower {
		score++
	} else {
		suggestions = append(suggestions, "Include lowercase letters")
	}

	if hasNumber {
		score++
	} else {
		suggestions = append(suggestions, "Include numbers")
	}

	if hasSpecial {
		score++
	} else {
		suggestions = append(suggestions, "Include special characters")
	}

	// Check for common patterns
	lowerPassword := strings.ToLower(password)
	commonPatterns := []string{"password", "123456", "qwerty", "admin", "login"}
	for _, pattern := range commonPatterns {
		if strings.Contains(lowerPassword, pattern) {
			score--
			suggestions = append(suggestions, "Avoid common words and patterns")
			break
		}
	}

	return score, suggestions
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
