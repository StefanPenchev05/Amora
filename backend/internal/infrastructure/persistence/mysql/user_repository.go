package mysql

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/StefanPenchev05/Amora/backend/internal/domain/user"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql/models"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

func (ur *UserRepository) Create(ctx context.Context, domainUser *user.User) error {
	// Generate UUID for the new user
	domainUser.ID = uuid.New().String()

	// Convert domain user to GORM model
	userModel := ur.domainToModel(domainUser)

	// Create user with all associations in a transaction
	if err := ur.db.WithContext(ctx).Create(userModel).Error; err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

func (ur *UserRepository) GetByID(ctx context.Context, id string) (*user.User, error) {
	var userModel models.User

	err := ur.db.WithContext(ctx).
		Preload("Credentials").
		Preload("Profile").
		First(&userModel, "id = ?", id).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user by ID: %w", err)
	}

	return ur.modelToDomain(&userModel)
}

func (ur *UserRepository) GetByEmail(ctx context.Context, email user.Email) (*user.User, error) {
	var userModel models.User

	err := ur.db.WithContext(ctx).
		Preload("Credentials").
		Preload("Profile").
		Joins("JOIN credentials ON credentials.user_id = users.id").
		Where("credentials.email = ?", email.String()).
		First(&userModel).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to bet user by email: %w ", err)
	}

	return ur.modelToDomain(&userModel)
}

func (ur *UserRepository) GetByUsername(ctx context.Context, username user.Username) (*user.User, error) {
	var userModel models.User

	err := ur.db.WithContext(ctx).
		Preload("Credentials").
		Preload("Profile").
		Joins("JOIN credentials ON credentials.user_id = users.id").
		Where("credentials.username = ?", username.String()).
		First(&userModel).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user by username: %w", err)
	}

	return ur.modelToDomain(&userModel)
}

func (ur *UserRepository) Update(ctx context.Context, domainUser *user.User) error {
	userModel := ur.domainToModel(domainUser)
	userModel.UpdatedAt = time.Now()

	// We use transaction to update all related models
	return ur.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Update main user record
		if err := tx.Save(&userModel).Error; err != nil {
			return fmt.Errorf("failed to update user: %w", err)
		}

		// Update credentials
		if err := tx.Save(&userModel.Credentials).Error; err != nil {
			return fmt.Errorf("failed to update credentials: %w", err)
		}

		// Update profile
		if err := tx.Save(&userModel.Profile).Error; err != nil {
			return fmt.Errorf("failed to update profile: %w", err)
		}

		return nil
	})
}

func (ur *UserRepository) DeleteByID(ctx context.Context, id string) error {
	result := ur.db.WithContext(ctx).Delete(&models.User{}, "id = ?", id)

	if result.Error != nil {
		return fmt.Errorf("failed to delete user: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

func (ur *UserRepository) Exists(ctx context.Context, email user.Email, username user.Username) (bool, error) {
	var count int64

	err := ur.db.WithContext(ctx).
		Model(&models.Credentials{}).
		Where("email = ? OR username = ?", email.String(), username.String()).
		Count(&count).Error

	if err != nil {
		return false, fmt.Errorf("failed to check user existance: %w", err)
	}

	return count > 0, nil
}

// Domain to Model conversion
func (r *UserRepository) domainToModel(domainUser *user.User) *models.User {
	return &models.User{
		ID:        domainUser.ID,
		CreatedAt: domainUser.CreatedAt,
		UpdatedAt: domainUser.UpdatedAt,
		Credentials: models.Credentials{
			UserID:        domainUser.ID,
			Email:         domainUser.Credentials.Email.String(),
			Username:      domainUser.Credentials.Username.String(),
			Password:      domainUser.Credentials.PasswordHash.String(),
			EmailVerified: domainUser.Credentials.EmailVerified,
			MfaEnabled:    domainUser.Credentials.MfaEnabled,
			MfaSecret:     domainUser.Credentials.MfaSecret,
			LastLoginAt:   domainUser.Credentials.LastLoginAt,
		},
		Profile: models.Profile{
			UserID:         domainUser.ID,
			FirstName:      domainUser.Profile.FirstName,
			LastName:       domainUser.Profile.LastName,
			Gender:         models.Gender(domainUser.Profile.Gender.String()),
			DateOfBirth:    domainUser.Profile.DateOfBirth,
			Bio:            domainUser.Profile.Bio,
			DisplayName:    domainUser.Profile.DisplayName,
			AvatarPhotoID:  domainUser.Profile.AvatarPhotoID,
			RelationshipID: domainUser.Profile.RelationshipID,
			Locale:         domainUser.Profile.Locale,
			Timezone:       domainUser.Profile.Timezone,
		},
	}
}

// Model to Domain conversion
func (r *UserRepository) modelToDomain(userModel *models.User) (*user.User, error) {
	// Reconstruct value objects from strings
	email, err := user.NewEmail(userModel.Credentials.Email)
	if err != nil {
		return nil, fmt.Errorf("invalid email in database: %w", err)
	}

	username, err := user.NewUsername(userModel.Credentials.Username)
	if err != nil {
		return nil, fmt.Errorf("invalid username in database: %w", err)
	}

	passwordHash, err := user.NewPasswordHashFromString(userModel.Credentials.Password)
	if err != nil {
		return nil, fmt.Errorf("invalid password hash in database: %w", err)
	}

	gender, err := user.NewGender(string(userModel.Profile.Gender))
	if err != nil {
		return nil, fmt.Errorf("invalid gender in database: %w", err)
	}

	// Build domain user with empty events slice
	domainUser := &user.User{
		ID:        userModel.ID,
		CreatedAt: userModel.CreatedAt,
		UpdatedAt: userModel.UpdatedAt,
		Credentials: user.Credentials{
			Email:         email,
			Username:      username,
			PasswordHash:  passwordHash,
			EmailVerified: userModel.Credentials.EmailVerified,
			MfaEnabled:    userModel.Credentials.MfaEnabled,
			MfaSecret:     userModel.Credentials.MfaSecret,
			LastLoginAt:   userModel.Credentials.LastLoginAt,
		},
		Profile: user.Profile{
			FirstName:      userModel.Profile.FirstName,
			LastName:       userModel.Profile.LastName,
			Gender:         gender,
			DateOfBirth:    userModel.Profile.DateOfBirth,
			Bio:            userModel.Profile.Bio,
			DisplayName:    userModel.Profile.DisplayName,
			AvatarPhotoID:  userModel.Profile.AvatarPhotoID,
			RelationshipID: userModel.Profile.RelationshipID,
			Locale:         userModel.Profile.Locale,
			Timezone:       userModel.Profile.Timezone,
		},
	}

	// Initialize empty events slice (events are not persisted)
	domainUser.ClearEvents()

	return domainUser, nil
}
