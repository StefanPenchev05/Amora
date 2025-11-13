package config

import (
	"os"
	"time"
)

type JWTConfig struct {
	AccessSecret  string        `env:"JWT_ACCESS_SECRET" envDefault:"zKpMMHAdC1usbIKsAN+hcCcYphCSEbaGbeTxrMp7FdGPawG/fcTYW7AN4DWE"`
	RefreshSecret string        `env:"JWT_REFRESH_SECRET" envDefault:"ZyvKYcPgNtxkNMqX8bf9TCL4gF1Chl2JhKES9iUvkIEN52/Ty32DlrsEW10+"`
	AccessTTL     time.Duration `env:"JWT_ACCESS_EXPIRY" envDefault:"15m"`
	RefreshTTL    time.Duration `env:"JWT_REFRESH_EXPIRY" envDefault:"720h"`
	Issuer        string        `env:"JWT_ISSUER" envDefault:"amora-api"`
	Audience      string        `env:"JWT_AUDIENCE" envDefault:"amora-users"`
}

func loadJWTConfig(jwtConfig *JWTConfig) error {
	ttlAccessDuration, err := parseDuration("JWT_ACCESS_TTL", "15m")
	if err != nil {
		return err
	}
	jwtConfig.AccessTTL = ttlAccessDuration

	ttlRefreshDuration, err := parseDuration("JWT_REFRESH_TTL", "720h")
	if err != nil {
		return err
	}
	jwtConfig.RefreshTTL = ttlRefreshDuration

	jwtConfig.AccessSecret = os.Getenv("JWT_ACCESS_SECRET")
	if jwtConfig.AccessSecret == "" {
		return &ConfigError{
			Field:   "JWT_ACCESS_SECRET",
			Message: "JWT access secret is required",
		}
	}

	if len(jwtConfig.AccessSecret) < 32 {
		return ConfigError{
			Field:   "JWT_ACCESS_SECRET",
			Message: "JWT access secret must be at least 32 characters long",
		}
	}

	jwtConfig.RefreshSecret = os.Getenv("JWT_REFRESH_SECRET")
	if jwtConfig.RefreshSecret == "" {
		return &ConfigError{
			Field:   "JWT_REFRESH_SECRET",
			Message: "JWT refresh secret is required",
		}
	}

	if len(jwtConfig.RefreshSecret) < 32 {
		return ConfigError{
			Field:   "JWT_REFRESH_SECRET",
			Message: "JWT refresh secret must be at least 32 characters long",
		}
	}

	jwtConfig.Issuer = os.Getenv("JWT_ISSUER")
	if jwtConfig.Issuer == "" {
		return &ConfigError{
			Field:   "JWT_ISSUER",
			Message: "JWT issuer is required",
		}
	}

	jwtConfig.Audience = os.Getenv("JWT_AUDIENCE")
	if jwtConfig.Audience == "" {
		return &ConfigError{
			Field:   "JWT_AUDIENCE",
			Message: "JWT Audience is required",
		}
	}

	return nil
}
