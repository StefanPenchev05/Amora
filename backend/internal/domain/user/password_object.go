package user

import (
	"errors"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

type PasswordHash struct {
	hash string
}

func validatePassword(password string) error {
	if password == "" {
		return errors.New("password is required")
	}

	if len(password) < 8 {
		return errors.New("password must be at least 8 characters")
	}

	if len(password) > 128 {
		return errors.New("password too long (max 128 characters)")
	}

	// Check for at least one uppercase, lowercase, number, and special character
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

	if !hasUpper {
		return errors.New("password must contain at least one uppercase letter")
	}
	if !hasLower {
		return errors.New("password must contain at least one lowercase letter")
	}
	if !hasNumber {
		return errors.New("password must contain at least one number")
	}
	if !hasSpecial {
		return errors.New("password must contain at least one special character")
	}

	return nil
}

func NewPasswordHashed(password string) (PasswordHash, error) {
	if err := validatePassword(password); err != nil {
		return PasswordHash{}, err
	}

	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return PasswordHash{}, errors.New("failed to hash password")
	}

	return PasswordHash{hash: string(hashedBytes)}, nil
}

func NewPasswordHashFromString(hash string) (PasswordHash, error) {
	if strings.TrimSpace(hash) == "" {
		return PasswordHash{}, errors.New("password hash cannot be empty")
	}

	return PasswordHash{hash: hash}, nil
}

func (p PasswordHash) Verify(other string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(p.hash), []byte(other))
	return err == nil
}

func (p PasswordHash) String() string {
	return p.hash
}
