package user

import "time"

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
