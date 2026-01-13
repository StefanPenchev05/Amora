package mysql

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/StefanPenchev05/Amora/backend/internal/domain/note"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql/models"
)

type NoteRepository struct {
	db *gorm.DB
}

func NewNoteRepository(db *gorm.DB) *NoteRepository {
	return &NoteRepository{db: db}
}

func (r *NoteRepository) Create(ctx context.Context, domainNote *note.Note) error {
	domainNote.ID = uuid.New().String()
	
	model := &models.Note{
		ID:        domainNote.ID,
		UserID:    domainNote.UserID,
		Title:     domainNote.Title,
		Content:   domainNote.Content,
		Color:     string(domainNote.Color),
		IsPinned:  domainNote.IsPinned,
		CreatedAt: domainNote.CreatedAt,
		UpdatedAt: domainNote.UpdatedAt,
	}
	
	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return fmt.Errorf("failed to create note: %w", err)
	}
	
	return nil
}

func (r *NoteRepository) GetByID(ctx context.Context, id string) (*note.Note, error) {
	var model models.Note
	
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("note not found")
		}
		return nil, fmt.Errorf("failed to get note: %w", err)
	}
	
	return r.modelToDomain(&model), nil
}

func (r *NoteRepository) GetByUserID(ctx context.Context, userID string) ([]*note.Note, error) {
	var models []models.Note
	
	if err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("is_pinned DESC, updated_at DESC").
		Find(&models).Error; err != nil {
		return nil, fmt.Errorf("failed to get notes: %w", err)
	}
	
	notes := make([]*note.Note, len(models))
	for i, m := range models {
		notes[i] = r.modelToDomain(&m)
	}
	
	return notes, nil
}

func (r *NoteRepository) Update(ctx context.Context, domainNote *note.Note) error {
	model := &models.Note{
		ID:        domainNote.ID,
		UserID:    domainNote.UserID,
		Title:     domainNote.Title,
		Content:   domainNote.Content,
		Color:     string(domainNote.Color),
		IsPinned:  domainNote.IsPinned,
		UpdatedAt: domainNote.UpdatedAt,
	}
	
	if err := r.db.WithContext(ctx).Save(model).Error; err != nil {
		return fmt.Errorf("failed to update note: %w", err)
	}
	
	return nil
}

func (r *NoteRepository) Delete(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).Delete(&models.Note{}, "id = ?", id)
	
	if result.Error != nil {
		return fmt.Errorf("failed to delete note: %w", result.Error)
	}
	
	if result.RowsAffected == 0 {
		return fmt.Errorf("note not found")
	}
	
	return nil
}

func (r *NoteRepository) modelToDomain(model *models.Note) *note.Note {
	return &note.Note{
		ID:        model.ID,
		UserID:    model.UserID,
		Title:     model.Title,
		Content:   model.Content,
		Color:     note.NoteColor(model.Color),
		IsPinned:  model.IsPinned,
		CreatedAt: model.CreatedAt,
		UpdatedAt: model.UpdatedAt,
	}
}
