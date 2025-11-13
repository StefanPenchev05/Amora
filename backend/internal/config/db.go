package config

import (
	"fmt"
	"os"
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

	dbConfig.DSN = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&charset=utf8mb4&collation=utf8mb4_unicode_ci",
		dbConfig.User, dbConfig.Password, dbConfig.Host, dbConfig.Port, dbConfig.Name)

	return nil
}
