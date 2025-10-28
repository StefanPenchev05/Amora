package user

import (
	"errors"
	"strings"
)

type Gender string

const (
	GenderMale           Gender = "male"
	GenderFemale         Gender = "female"
	GenderSomethingElse  Gender = "something_else"
	GenderPreferNotToSay Gender = "prefer_not_to_say"
)

func NewGender(gender string) (Gender, error) {
	g := Gender(strings.ToLower(strings.TrimSpace(gender)))

	switch g {
	case GenderMale, GenderFemale, GenderSomethingElse, GenderPreferNotToSay, "":
		return g, nil
	default:
		return "", errors.New("invalid gender")
	}
}

func (g Gender) String() string {
	return string(g)
}

func (g Gender) IsValid() bool {
	switch g {
	case GenderMale, GenderFemale, GenderSomethingElse, GenderPreferNotToSay, "":
		return true
	default:
		return false
	}
}

func (g Gender) IsEmpty() bool {
	return g == ""
}

// GetDisplayName returns human-readable gender name
func (g Gender) GetDisplayName() string {
	switch g {
	case GenderMale:
		return "Male"
	case GenderFemale:
		return "Female"
	case GenderSomethingElse:
		return "Something else"
	case GenderPreferNotToSay:
		return "Prefer not to say"
	default:
		return ""
	}
}
