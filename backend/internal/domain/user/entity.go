package user

import (
	"errors"
	"time"
)

const (
	firstNameField = "first name"
	lastNameField  = "last name"
)

// User is aggregate root for the user bounded context
type User struct {
	ID        string
	CreatedAt time.Time
	UpdatedAt time.Time

	Credentials Credentials
	Profile     Profile

	// Events stored in memory
	events []DomainEvent
}

func validateName(name, fieldName string) error {
	if name == "" {
		return errors.New(fieldName + " is required")
	}
	if len(name) > 50 {
		return errors.New(fieldName + " too long (max 50 characters)")
	}
	return nil
}

func validateBio(bio string) error {
	if len(bio) > 500 {
		return errors.New("bio too long (max 500 characters)")
	}
	return nil
}

// NewUser creates a new user with validation
func NewUser(email, username, firstName, lastName string) (*User, error) {
	emailVO, err := NewEmail(email)
	if err != nil {
		return nil, err
	}

	usernameVO, err := NewUsername(username)
	if err != nil {
		return nil, err
	}

	if err := validateName(firstName, firstNameField); err != nil {
		return nil, err
	}
	if err := validateName(lastName, lastNameField); err != nil {
		return nil, err
	}

	now := time.Now()
	user := &User{
		// ID will be set by the database/repository layer
		CreatedAt: now,
		UpdatedAt: now,
		Credentials: Credentials{
			Email:         emailVO,
			Username:      usernameVO,
			EmailVerified: false,
			MfaEnabled:    false,
		},
		Profile: Profile{
			FirstName: firstName,
			LastName:  lastName,
			Locale:    "en",
			Timezone:  "UTC",
		},
		events: make([]DomainEvent, 0),
	}

	// Raise domain event
	user.raiseEvent(NewUserCreatedEvent("", email, username, firstName, lastName))

	return user, nil
}

func (u *User) raiseEvent(event DomainEvent) {
	u.events = append(u.events, event)
}

// UpdateProfile updates user profile with validation
func (u *User) UpdateProfile(firstName, lastName, bio string, gender Gender) error {
	if err := validateName(firstName, firstNameField); err != nil {
		return err
	}
	if err := validateName(lastName, lastNameField); err != nil {
		return err
	}
	if err := validateBio(bio); err != nil {
		return err
	}
	if err := validateGender(gender); err != nil {
		return err
	}

	u.Profile.FirstName = firstName
	u.Profile.LastName = lastName
	if bio != "" {
		u.Profile.Bio = &bio
	}
	u.Profile.Gender = gender
	u.UpdatedAt = time.Now()

	return nil
}

func validateGender(gender Gender) error {
	switch gender {
	case GenderFemale, GenderMale, GenderSomethingElse, GenderPreferNotToSay, "":
		return nil
	default:
		return errors.New("invalid gender")
	}
}

// Child entities which are part of the aggregate root
type Credentials struct {
	UserID        string
	Email         Email
	Username      Username
	PasswordHash  PasswordHash
	EmailVerified bool
	MfaEnabled    bool
	MfaSecret     *string
	LastLoginAt   *time.Time
}

type Profile struct {
	UserID         string
	FirstName      string
	LastName       string
	Gender         Gender
	DateOfBirth    *time.Time
	Bio            *string
	DisplayName    *string
	AvatarPhotoID  *string
	RelationshipID *string
	Locale         string
	Timezone       string
}
