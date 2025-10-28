package user

import (
	"errors"
	"regexp"
	"strings"
)

type Username struct {
	value string
}

func NewUsername(username string) (Username, error) {
	username = strings.TrimSpace(username)
	if username == "" {
		return Username{}, errors.New("username is required")
	}

	if len(username) < 3 {
		return Username{}, errors.New("username msut be at least 3 characters")
	}

	if len(username) > 30 {
		return Username{}, errors.New("useraname too long (max 30 characters)")
	}

	usernameRegex := regexp.MustCompile(`^[a-zA-Z0-9_]+$`)
	if !usernameRegex.MatchString(username) {
		return Username{}, errors.New("username can only contain letters, numbers, and underscores")
	}

	return Username{value: username}, nil
}

func (e Username) Equals(other Username) bool {
	return e.value == other.value
}

func (e Username) String() string {
	return e.value
}
