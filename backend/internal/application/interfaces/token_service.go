package interfaces

// JWTService interface for token operations
type JWTService interface {
	GenerateAccessToken(userID string) (string, error)
	GenerateRefreshToken(userID string) (string, error)
	ValidateToken(token string) (*TokenClaims, error)
	RefreshAccessToken(refreshToken string) (string, error)
}

// TokenClaims represents JWT token claims
type TokenClaims struct {
	UserID    string `json:"user_id"`
	ExpiresAt int64  `json:"exp"`
	IssuedAt  int64  `json:"iat"`
}
