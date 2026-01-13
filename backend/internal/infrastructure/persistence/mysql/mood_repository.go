package mysql

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/StefanPenchev05/Amora/backend/internal/domain/mood"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql/models"
)

type MoodRepository struct {
	db *gorm.DB
}

func NewMoodRepository(db *gorm.DB) *MoodRepository {
	return &MoodRepository{db: db}
}

func (r *MoodRepository) Create(ctx context.Context, domainMood *mood.Mood) error {
	domainMood.ID = uuid.New().String()

	model := &models.Mood{
		ID:        domainMood.ID,
		UserID:    domainMood.UserID,
		Level:     int(domainMood.Level),
		Note:      domainMood.Note,
		MoodDate:  domainMood.MoodDate,
		CreatedAt: domainMood.CreatedAt,
		UpdatedAt: domainMood.UpdatedAt,
	}

	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return fmt.Errorf("failed to create mood: %w", err)
	}

	return nil
}

func (r *MoodRepository) GetByID(ctx context.Context, id string) (*mood.Mood, error) {
	var model models.Mood

	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("mood not found")
		}
		return nil, fmt.Errorf("failed to get mood: %w", err)
	}

	return r.modelToDomain(&model), nil
}

func (r *MoodRepository) GetByUserID(ctx context.Context, userID string) ([]*mood.Mood, error) {
	var models []models.Mood

	if err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("mood_date DESC").
		Find(&models).Error; err != nil {
		return nil, fmt.Errorf("failed to get moods: %w", err)
	}

	moods := make([]*mood.Mood, len(models))
	for i, m := range models {
		moods[i] = r.modelToDomain(&m)
	}

	return moods, nil
}

func (r *MoodRepository) GetByUserIDAndDateRange(ctx context.Context, userID string, startDate, endDate time.Time) ([]*mood.Mood, error) {
	var models []models.Mood

	if err := r.db.WithContext(ctx).
		Where("user_id = ? AND mood_date >= ? AND mood_date <= ?", userID, startDate, endDate).
		Order("mood_date ASC").
		Find(&models).Error; err != nil {
		return nil, fmt.Errorf("failed to get moods: %w", err)
	}

	moods := make([]*mood.Mood, len(models))
	for i, m := range models {
		moods[i] = r.modelToDomain(&m)
	}

	return moods, nil
}

func (r *MoodRepository) Update(ctx context.Context, domainMood *mood.Mood) error {
	model := &models.Mood{
		ID:        domainMood.ID,
		UserID:    domainMood.UserID,
		Level:     int(domainMood.Level),
		Note:      domainMood.Note,
		MoodDate:  domainMood.MoodDate,
		UpdatedAt: domainMood.UpdatedAt,
	}

	if err := r.db.WithContext(ctx).Save(model).Error; err != nil {
		return fmt.Errorf("failed to update mood: %w", err)
	}

	return nil
}

func (r *MoodRepository) Delete(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).Delete(&models.Mood{}, "id = ?", id)

	if result.Error != nil {
		return fmt.Errorf("failed to delete mood: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("mood not found")
	}

	return nil
}

func (r *MoodRepository) modelToDomain(model *models.Mood) *mood.Mood {
	return &mood.Mood{
		ID:        model.ID,
		UserID:    model.UserID,
		Level:     mood.MoodLevel(model.Level),
		Note:      model.Note,
		MoodDate:  model.MoodDate,
		CreatedAt: model.CreatedAt,
		UpdatedAt: model.UpdatedAt,
	}
}
