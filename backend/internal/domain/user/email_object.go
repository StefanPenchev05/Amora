package user

import (
	"errors"
	"regexp"
	"strings"
)

type Email struct {
	value string
}

func NewEmail(email string) (Email, error) {
	email = strings.TrimSpace(strings.ToLower(email))

	if email == "" {
		return Email{}, errors.New("Email is required")
	}

	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return Email{}, errors.New("invalid email format")
	}

	if len(email) > 255 {
		return Email{}, errors.New("email too long (max 255 characters)")
	}

	return Email{value: email}, nil
}

func (e Email) String() string {
	return e.value
}

func (e Email) Equals(other Email) bool {
	return e.value == other.value
}
