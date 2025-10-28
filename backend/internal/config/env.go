package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

// DBConfig holds database configurations
type DBConfig struct {
	User     string
	Password string
	Host     string
	Port     string
	Name     string
	DSN      string
}

// JWTConfig holds JWT-related configuration
type JWTConfig struct {
	Secret     string
	AccessTTL  time.Duration
	RefreshTTL time.Duration
}

// ServerConfig holds server configuration
type ServerConfig struct {
	Port         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	IdleTimeout  time.Duration
}

// Config represents the application configuration
type Config struct {
	Environment string
	Server      ServerConfig
	Database    DBConfig
	JWT         JWTConfig
	Debug       bool
}

// ConfigError represents configuration-related errors
type ConfigError struct {
	Field   string
	Message string
}

func (e ConfigError) Error() string {
	return fmt.Sprintf("config error [%s]: %s", e.Field, e.Message)
}

func Load() (*Config, error) {
	config := &Config{}

	// Environment
	config.Environment = getEnvWithDefualt("APP_ENV", "development")

	// Server Config
	config.Server.Port = getEnvWithDefualt("PORT", "8080")

	readTimeout, err := parseDuration("SERVER_READ_TIMEOUT", "30s")
	if err != nil {
		return nil, err
	}
	config.Server.ReadTimeout = readTimeout

	writeTimeout, err := parseDuration("SERVER_WRITE_TIMEOUT", "30s")
	if err != nil {
		return nil, err
	}
	config.Server.WriteTimeout = writeTimeout

	idleTimeout, err := parseDuration("SERVER_IDLE_TIMEOUT", "120s")
	if err != nil {
		return nil, err
	}
	config.Server.IdleTimeout = idleTimeout

	// Database Config
	if err := loadDatabaseConfig(&config.Database); err != nil {
		return nil, err
	}

	// JWT Config
	if err := loadJWTConfig(&config.JWT); err != nil {
		return nil, err
	}

	// Debug mode
	config.Debug = getEnvAsBool("DEBUG", false)

	// Validate configuration
	if err := config.Validate(); err != nil {
		return nil, err
	}

	return config, nil
}

func loadDatabaseConfig(dbConfig *DBConfig) error {
	var missing []string

	dbConfig.User = os.Getenv("DB_USER")
	if dbConfig.User == "" {
		missing = append(missing, "DB_USER")
	}

	dbConfig.Password = os.Getenv("DB_PASS")
	if dbConfig.Password == "" {
		missing = append(missing, "DB_PASS")
	}

	dbConfig.Host = getEnvWithDefualt("DB_HOST", "localhost")
	dbConfig.Port = getEnvWithDefualt("DB_PORT", "3306")
	dbConfig.Name = os.Getenv("DB_NAME")
	if dbConfig.Name == "" {
		missing = append(missing, "DB_NAME")
	}

	if len(missing) > 0 {
		return &ConfigError{
			Field:   "database",
			Message: fmt.Sprintf("missing required environment variables: %v", missing),
		}
	}

	// Build DSN
	dbConfig.DSN = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbConfig.User, dbConfig.Password, dbConfig.Host, dbConfig.Port, dbConfig.Name)

	return nil
}

func loadJWTConfig(jwtConfig *JWTConfig) error {
	ttlAccessDuration, err := parseDuration("ACCESS_TTL", "15m")
	if err != nil {
		return err
	}
	jwtConfig.AccessTTL = ttlAccessDuration

	ttlRefreshDuration, err := parseDuration("ACCESS_TTL", "15m")
	if err != nil {
		return err
	}
	jwtConfig.RefreshTTL = ttlRefreshDuration

	jwtConfig.Secret = os.Getenv("JWT_SECRET")
	if jwtConfig.Secret == "" {
		return &ConfigError{
			Field:   "JWT_SECRET",
			Message: "JWT secret is required",
		}
	}

	if len(jwtConfig.Secret) < 32 {
		return ConfigError{
			Field:   "JWT_SECRET",
			Message: "JWT secret must be at least 32 characters long",
		}
	}

	return nil
}

// Validate performs comprehensive configuration validation
func (c *Config) Validate() error {
	// Validate environment
	validEnvs := []string{"development", "staging", "production"}
	if !contains(validEnvs, c.Environment) {
		return ConfigError{
			Field:   "APP_ENV",
			Message: fmt.Sprintf("invalid environment: %s (must be one of: %v)", c.Environment, validEnvs),
		}
	}

	// Validate server port
	if port, err := strconv.Atoi(c.Server.Port); err != nil || port < 1 || port > 65535 {
		return ConfigError{
			Field:   "PORT",
			Message: "port must be a valid number between 1 and 65535",
		}
	}

	// Validate timeouts
	var mustBePositive string = "must be positive"
	if c.Server.ReadTimeout <= 0 {
		return ConfigError{Field: "SERVER_READ_TIMEOUT", Message: mustBePositive}
	}
	if c.Server.WriteTimeout <= 0 {
		return ConfigError{Field: "SERVER_WRITE_TIMEOUT", Message: mustBePositive}
	}
	if c.Server.IdleTimeout <= 0 {
		return ConfigError{Field: "SERVER_IDLE_TIMEOUT", Message: mustBePositive}
	}

	// Validate JWT TTL values
	if c.JWT.AccessTTL <= 0 {
		return ConfigError{Field: "ACCESS_TTL", Message: "access token TTL must be positive"}
	}
	if c.JWT.RefreshTTL <= 0 {
		return ConfigError{Field: "REFRESH_TTL", Message: "refresh token TTL must be positive"}
	}
	if c.JWT.RefreshTTL <= c.JWT.AccessTTL {
		return ConfigError{
			Field:   "token_ttl",
			Message: "refresh token TTL must be greater than access token TTL",
		}
	}

	return nil
}

// getEnvAsBool returns environment variable as boolean
func getEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.ParseBool(value); err == nil {
			return parsed
		}
	}
	return defaultValue
}

func parseDuration(key, defaultValue string) (time.Duration, error) {
	value := getEnvWithDefualt(key, defaultValue)
	duration, err := time.ParseDuration(value)
	if err != nil {
		return 0, &ConfigError{
			Field:   key,
			Message: fmt.Sprintf("invalid duration format: %s", value),
		}
	}

	return duration, nil
}

// IsDevelopment returns true if the environment is development
func (c *Config) IsDevelopment() bool {
	return c.Environment == "development"
}

// IsProduction returns true if the environment is production
func (c *Config) IsProduction() bool {
	return c.Environment == "production"
}

func getEnvWithDefualt(key, defualtValue string) string {
	if value := os.Getenv(key); value != " " {
		return value
	}

	return defualtValue
}

// contains checks if slice contains a value
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}

	return false
}
