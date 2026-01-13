package mysql

import (
	"fmt"
	"log"
	"time"

	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type ConnectionConfig struct {
	Host            string
	port            string
	user            string
	password        string
	database        string
	MaxIdleConns    int
	MaxOpenConns    int
	ConnMaxLifetime time.Duration
	LogLevel        logger.LogLevel
}

func NewGormConnection(dsn string) (*gorm.DB, error) {
	return NewGormConnectionWithConfig(dsn, &ConnectionConfig{
		MaxIdleConns:    10,
		MaxOpenConns:    100,
		ConnMaxLifetime: time.Hour,
		LogLevel:        logger.Info,
	})
}

func NewGormConnectionWithConfig(dsn string, cfg *ConnectionConfig) (*gorm.DB, error) {
	// Configure GORM
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(cfg.LogLevel),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
		PrepareStmt:              true,
		DisableNestedTransaction: false,
	}

	// Open Connection
	db, err := gorm.Open(mysql.Open(dsn), gormConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying database: %w", err)
	}

	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
	sqlDB.SetConnMaxLifetime(cfg.ConnMaxLifetime)

	// Test connection
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Auto Migrate Tabels
	if err := autoMigrate(db); err != nil {
		log.Printf("ERROR in autoMigrate: %v", err)
		return nil, fmt.Errorf("auto-migrate failed: %w", err)
	}

	return db, nil
}

func autoMigrate(db *gorm.DB) error {
	models := []interface{}{
		&models.Relationship{},
		&models.User{},
		&models.Credentials{},
		&models.Profile{},
		&models.Session{},
		&models.RefreshToken{},
		&models.Event{},
		&models.Mood{},
		&models.Note{},
		&models.Memory{},
		&models.Expense{},
	}

	for _, model := range models {
		log.Printf(" > Migrating %T...", model)
		if err := db.AutoMigrate(model); err != nil {
			return fmt.Errorf("failed to migrate %T: %w", model, err)
		}
	}

	// Ensure avatar_photo_id can store filenames like '<uuid>.jpg'.
	if err := widenAvatarPhotoIDColumn(db); err != nil {
		return err
	}

	return nil
}

func widenAvatarPhotoIDColumn(db *gorm.DB) error {
	// MySQL: GORM AutoMigrate doesn't always widen existing column types.
	// We store filenames (uuid + extension), so the column must be wider than CHAR(36).
	res := db.Exec("ALTER TABLE profiles MODIFY COLUMN avatar_photo_id VARCHAR(255) NULL")
	if res.Error != nil {
		return fmt.Errorf("failed to widen profiles.avatar_photo_id: %w", res.Error)
	}
	return nil
}

// CloseConnection closes the database connection
func CloseConnection(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying database: %w", err)
	}

	if err := sqlDB.Close(); err != nil {
		return fmt.Errorf("failed to close database connection: %w", err)
	}

	log.Println("Database connection closed")
	return nil
}
