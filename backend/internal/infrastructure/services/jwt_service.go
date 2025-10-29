package services

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTServiceImpl struct {
	accessSecret       string
	refreshSecret      string
	accessTokenExpiry  time.Duration
	refreshTokenExpiry time.Duration
	issuer             string
	audience           string
}

func NewJWTServiceImpl(
	accessSecret string,
	refreshSecret string,
	accessTokenExpiry time.Duration,
	refreshTokenExpiry time.Duration,
	issuer string,
	audience string,
) *JWTServiceImpl {
	return &JWTServiceImpl{
		accessSecret:       accessSecret,
		refreshSecret:      refreshSecret,
		accessTokenExpiry:  accessTokenExpiry,
		refreshTokenExpiry: refreshTokenExpiry,
		issuer:             issuer,
		audience:           audience,
	}
}

func (t *JWTServiceImpl) GenerateAccessToken(userID string) (string, error) {
	if userID == "" {
		return "", fmt.Errorf("userID cannot be empty")
	}

	now := time.Now()
	claim := jwt.MapClaims{
		"user_id": userID,
		"exp":     now.Add(t.accessTokenExpiry).Unix(),
		"iat":     now.Unix(),
		"iss":     t.issuer,
		"aud":     t.audience,
		"type":    "access",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claim)
	signedToken, err := token.SignedString([]byte(t.accessSecret))
	if err != nil {
		return "", fmt.Errorf("failed to sign access token: %w", err)
	}

	return signedToken, nil
}
