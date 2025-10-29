package user

import (
	"errors"
	"fmt"
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

// Core business methods
func (u *User) ChangePassword(currentPassword, newPassword string) error {
	// Check if currentPassword match the passwordHash
	if !u.Credentials.PasswordHash.Verify(currentPassword) {
		return errors.New("current password is incorrect")
	}

	newHash, err := NewPasswordHashed(newPassword)
	if err != nil {
		return err
	}

	u.Credentials.PasswordHash = newHash
	u.UpdatedAt = time.Now()
	return nil
}

func (u *User) VerifyEmail() {
	u.Credentials.EmailVerified = true
	u.UpdatedAt = time.Now()
	u.raiseEvent(NewUserEmailVerifiedEvent(u.ID, u.Credentials.Email.String()))
}

func (u *User) IsEmailVerified() bool {
	return u.Credentials.EmailVerified
}

func (u *User) GetFullName() string {
	return fmt.Sprintf("%s %s", u.Profile.FirstName, u.Profile.LastName)
}

// Events
func (u *User) RecordLogin(ipAddress, userAgent string) {
	now := time.Now()
	u.Credentials.LastLoginAt = &now
	u.UpdatedAt = now
	u.raiseEvent(NewUserLoggedInEvent(u.ID, u.Credentials.Email.String(), u.Credentials.Username.String(), ipAddress, userAgent))
}

func (u *User) raiseEvent(event DomainEvent) {
	u.events = append(u.events, event)
}

func (u *User) GetEvents() []DomainEvent {
	return u.events
}

func (u *User) ClearEvents() {
	u.events = make([]DomainEvent, 0)
}
