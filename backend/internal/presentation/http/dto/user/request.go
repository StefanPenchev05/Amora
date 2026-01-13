package user

// CreateUserRequest represents the input for user creation
type CreateUserRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Username  string `json:"username" binding:"required,min=3,max=30"`
	FirstName string `json:"first_name" binding:"required,max=50"`
	LastName  string `json:"last_name" binding:"required,max=50"`
	Password  string `json:"password" binding:"required,min=8"`
	// AvatarPhotoID is an optional stored filename/id for the user's avatar.
	// It is typically set server-side when handling multipart uploads.
	AvatarPhotoID *string `json:"avatar_photo_id,omitempty"`
}

// AuthenticateRequest represents the login input
type AuthenticateUserRequest struct {
	EmailOrUsername string `json:"email_or_username" binding:"required"`
	Password        string `json:"password" binding:"required"`
	IPAddress       string `json:"ip_address,omitempty"`
	UserAgent       string `json:"user_agent,omitempty"`
}

// RefreshTokenRequest represents the input for refreshing an access token.
// It accepts both snake_case and camelCase for client compatibility.
type RefreshTokenRequest struct {
	RefreshToken  string `json:"refresh_token,omitempty"`
	RefreshToken2 string `json:"refreshToken,omitempty"`
}
