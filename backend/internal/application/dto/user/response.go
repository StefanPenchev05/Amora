package user

import (
	domainUser "github.com/StefanPenchev05/Amora/backend/internal/domain/user"
)

// CreateUserResponse represents the output after user creation
type CreateUserResponse struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Username  string `json:"username"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	CreatedAt string `json:"created_at"`
}

// AuthenticateUserResponse represents the output after login
type AuthenticateUserResponse struct {
	AccessToken  string         `json:"access_token"`
	RefreshToken string         `json:"refresh_token,omitempty"`
	ExpiresIn    int            `json:"exp"`
	TokenType    string         `json:"token_type"`
	User         UserProfile    `json:"user,omitempty"`
	Bootstrap    *AuthBootstrap `json:"bootstrap,omitempty"`
}

// Wrapper for UserProfile
type UserProfile struct {
	Email         string  `json:"email"`
	Username      string  `json:"username"`
	FirstName     string  `json:"first_name"`
	LastName      string  `json:"last_name"`
	FullName      string  `json:"full_name"`
	Bio           *string `json:"bio"`
	Gender        string  `json:"gender"`
	IsVerified    bool    `json:"is_verified"`
	MfaEnabled    bool    `json:"mfa_enabled"`
	AvatarPhotoID *string `json:"avatar_photo_id"`
	Locale        string  `json:"locale"`
	Timezone      string  `json:"timezone"`
	CreatedAt     string  `json:"created_at"`
}

// AuthBootstrap contains intial data needed by the client application
type AuthBootstrap struct {
	Permissions []string               `json:"permissions"`
	Settings    map[string]interface{} `json:"settings"`
	Features    []string               `json:"features"`
}

// Helper function to convert domain user to prfile
func NewUserProfile(domainUser *domainUser.User) UserProfile {
	profile := UserProfile{
		Email:         domainUser.Credentials.Email.String(),
		Username:      domainUser.Credentials.Username.String(),
		FirstName:     domainUser.Profile.FirstName,
		LastName:      domainUser.Profile.LastName,
		FullName:      domainUser.GetFullName(),
		Bio:           domainUser.Profile.Bio,
		Gender:        domainUser.Profile.Gender.String(),
		IsVerified:    domainUser.IsEmailVerified(),
		MfaEnabled:    domainUser.Credentials.MfaEnabled,
		AvatarPhotoID: domainUser.Profile.AvatarPhotoID,
		Locale:        domainUser.Profile.Locale,
		Timezone:      domainUser.Profile.Timezone,
		CreatedAt:     domainUser.CreatedAt.Format("2006-01-02T15:04:05Z"),
	}

	return profile
}

// Helper function to create bootstrap data
func NewAuthBootstrap(domainUser *domainUser.User) *AuthBootstrap {
	permissions := []string{"read:profile", "write:profile"}

	// TODO: Add admin permissions if user is admin
	// if domainUser.IsAdmin() {
	//     permissions = append(permissions, "admin:users", "admin:system")
	// }

	settings := map[string]interface{}{
		"theme":         "auto",
		"notifications": true,
		"language":      domainUser.Profile.Locale,
	}

	features := []string{"posts", "calendar", "notes"}

	// TODO: Add premium features if user has premium
	// if domainUser.HasPremium() {
	//     features = append(features, "advanced_analytics", "priority_support")
	// }

	return &AuthBootstrap{
		Permissions: permissions,
		Settings:    settings,
		Features:    features,
	}
}
