package mysql

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/StefanPenchev05/Amora/backend/internal/domain/memory"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql/models"
)

type MemoryRepository struct {
	db *gorm.DB
}

func NewMemoryRepository(db *gorm.DB) *MemoryRepository {
	return &MemoryRepository{db: db}
}

func (r *MemoryRepository) Create(ctx context.Context, domainMemory *memory.Memory) error {
	domainMemory.ID = uuid.New().String()

	model := &models.Memory{
		ID:          domainMemory.ID,
		UserID:      domainMemory.UserID,
		Title:       domainMemory.Title,
		Description: domainMemory.Description,
		Category:    string(domainMemory.Category),
		PhotoURL:    domainMemory.PhotoURL,
		MemoryDate:  domainMemory.MemoryDate,
		CreatedAt:   domainMemory.CreatedAt,
		UpdatedAt:   domainMemory.UpdatedAt,
	}

	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return fmt.Errorf("failed to create memory: %w", err)
	}

	return nil
}

func (r *MemoryRepository) GetByID(ctx context.Context, id string) (*memory.Memory, error) {
	var model models.Memory

	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("memory not found")
		}
		return nil, fmt.Errorf("failed to get memory: %w", err)
	}

	return r.modelToDomain(&model), nil
}

func (r *MemoryRepository) GetByUserID(ctx context.Context, userID string) ([]*memory.Memory, error) {
	var models []models.Memory

	if err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("memory_date DESC").
		Find(&models).Error; err != nil {
		return nil, fmt.Errorf("failed to get memories: %w", err)
	}

	memories := make([]*memory.Memory, len(models))
	for i, m := range models {
		memories[i] = r.modelToDomain(&m)
	}

	return memories, nil
}

func (r *MemoryRepository) GetByUserIDAndCategory(ctx context.Context, userID string, category memory.MemoryCategory) ([]*memory.Memory, error) {
	var models []models.Memory

	if err := r.db.WithContext(ctx).
		Where("user_id = ? AND category = ?", userID, string(category)).
		Order("memory_date DESC").
		Find(&models).Error; err != nil {
		return nil, fmt.Errorf("failed to get memories: %w", err)
	}

	memories := make([]*memory.Memory, len(models))
	for i, m := range models {
		memories[i] = r.modelToDomain(&m)
	}

	return memories, nil
}

func (r *MemoryRepository) Update(ctx context.Context, domainMemory *memory.Memory) error {
	model := &models.Memory{
		ID:          domainMemory.ID,
		UserID:      domainMemory.UserID,
		Title:       domainMemory.Title,
		Description: domainMemory.Description,
		Category:    string(domainMemory.Category),
		PhotoURL:    domainMemory.PhotoURL,
		MemoryDate:  domainMemory.MemoryDate,
		UpdatedAt:   domainMemory.UpdatedAt,
	}

	if err := r.db.WithContext(ctx).Save(model).Error; err != nil {
		return fmt.Errorf("failed to update memory: %w", err)
	}

	return nil
}

func (r *MemoryRepository) Delete(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).Delete(&models.Memory{}, "id = ?", id)

	if result.Error != nil {
		return fmt.Errorf("failed to delete memory: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("memory not found")
	}

	return nil
}

func (r *MemoryRepository) modelToDomain(model *models.Memory) *memory.Memory {
	return &memory.Memory{
		ID:          model.ID,
		UserID:      model.UserID,
		Title:       model.Title,
		Description: model.Description,
		Category:    memory.MemoryCategory(model.Category),
		PhotoURL:    model.PhotoURL,
		MemoryDate:  model.MemoryDate,
		CreatedAt:   model.CreatedAt,
		UpdatedAt:   model.UpdatedAt,
	}
}
