package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/StefanPenchev05/Amora/backend/internal/application/interfaces"
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

func (t *JWTServiceImpl) GenerateRefreshToken(userID string) (string, error) {
	if userID == "" {
		return "", errors.New("userID cannot be emmpty")
	}

	now := time.Now()
	claim := jwt.MapClaims{
		"user_id": userID,
		"exp":     now.Add(t.refreshTokenExpiry).Unix(),
		"iat":     now.Unix(),
		"iss":     t.issuer,
		"aud":     t.audience,
		"type":    "refresh",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claim)
	signedToken, err := token.SignedString([]byte(t.refreshSecret))
	if err != nil {
		return "", fmt.Errorf("failed to sign refresh token: %w", err)
	}

	return signedToken, nil
}

func (t *JWTServiceImpl) ValidateToken(tokenString string) (*interfaces.TokenClaims, error) {
	if tokenString == "" {
		return nil, errors.New("token cannot be empty")
	}

	// Try to parse with access token secret
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])

		}
		return []byte(t.accessSecret), nil
	})

	if err != nil {
		// if access token parsing fails, try refresh token secret
		token, err = jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}

			return []byte(t.refreshSecret), nil
		})

		if err != nil {
			return nil, fmt.Errorf("invalid token: %w", err)
		}
	}

	if !token.Valid {
		return nil, errors.New("token is not valid")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	// Validate required claims
	userID, ok := claims["user_id"].(string)
	if !ok || userID == "" {
		return nil, fmt.Errorf("invalid uer_id claim")
	}

	exp, ok := claims["exp"].(float64)
	if !ok {
		return nil, errors.New("invalid exp claim")
	}

	iat, ok := claims["iat"].(float64)
	if !ok {
		return nil, errors.New("invalid iat claim")
	}

	issuer, _ := claims["iss"].(string)
	audience, _ := claims["aud"].(string)
	tokenType, _ := claims["type"].(string)

	// Check if token is expired
	if time.Now().Unix() > int64(exp) {
		return nil, errors.New("token has expired")
	}

	return &interfaces.TokenClaims{
		UserID:    userID,
		ExpiresAt: int64(exp),
		IssuedAt:  int64(iat),
		Issuer:    issuer,
		Audience:  audience,
		Type:      tokenType,
	}, nil
}

func (t *JWTServiceImpl) RefreshAccessToken(refreshToken string) (string, error) {
	if refreshToken == "" {
		return "", fmt.Errorf("invalid refreshToken")
	}

	token, err := jwt.Parse(refreshToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method %v", token.Header["alg"])
		}

		return []byte(t.refreshSecret), nil
	})

	if err != nil {
		return "", fmt.Errorf("invalid refresh token: %w", err)
	}

	if !token.Valid {
		return "", errors.New("refresh token is not valid")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", errors.New("invalid refresh token claims")
	}

	// Verify it's actually a refresh token
	tokenType, ok := claims["type"].(string)
	if !ok || tokenType != "refresh" {
		return "", errors.New("token is not a refresh token")
	}

	// Extract user ID
	userID, ok := claims["user_id"].(string)
	if !ok || userID == "" {
		return "", errors.New("invalid user_id in refresh token")
	}

	// Check expiration
	exp, ok := claims["exp"].(float64)
	if !ok || time.Now().Unix() > int64(exp) {
		return "", errors.New("refresh token has expired")
	}

	// Generate new access token
	return t.GenerateAccessToken(userID)
}

func (t *JWTServiceImpl) GetAccessTokenExpiration() int64 {
	return int64(t.accessTokenExpiry.Seconds())
}
