package user

import "time"

// User is aggregate root for the user bounded context
type User struct {
	ID        string
	CreatedAt time.Time
	UpdatedAt time.Time

	Credentials Credentials
	Profile     Profile
}

// Child entities which are part of the aggrefate root
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
