package interfaces

// JWTService interface for token operations
type JWTService interface {
	// GenerateAccessToken creates a short-lived access token for the given user ID.
	GenerateAccessToken(userID string) (string, error)

	// GenerateRefreshToken creates a long-lived refresh token for the given user ID.
	GenerateRefreshToken(userID string) (string, error)

	// ValidateToken verifies and parses a JWT token string.
	ValidateToken(token string) (*TokenClaims, error)

	// RefreshAccessToken generates a new access token using a valid refresh token.
	RefreshAccessToken(refreshToken string) (string, error)

	// GetAccessTokenExpiration returns the expiration time in seconds for access tokens.
	GetAccessTokenExpiration() int64
}

// TokenClaims represents JWT token claims
type TokenClaims struct {
	// UserID is unique identifier of the authenticated user
	UserID string `json:"user_id"`

	// ExpiresAt is the Unix timestamp when the token expires
	ExpiresAt int64 `json:"exp"`

	// IssuedAt is the Unix timestamp when the token was signed/created
	IssuedAt int64 `json:"iat"`

	// Issuer identifies who issued the toke
	Issuer string `json:"iss"`

	// Audience identifies the intended recipients of the token
	Audience string `json:"aud"`

	// Role defiens the user's role
	Role string `json:"role"`

	// Scope defiens the permissions granted by this token
	Scope string `json:"scope"`
}
