package mysql

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/StefanPenchev05/Amora/backend/internal/domain/event"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql/models"
)

type EventRepository struct {
	db *gorm.DB
}

func NewEventRepository(db *gorm.DB) *EventRepository {
	return &EventRepository{db: db}
}

func (r *EventRepository) Create(ctx context.Context, domainEvent *event.Event) error {
	domainEvent.ID = uuid.New().String()

	model := &models.Event{
		ID:          domainEvent.ID,
		UserID:      domainEvent.UserID,
		Title:       domainEvent.Title,
		Description: domainEvent.Description,
		Category:    string(domainEvent.Category),
		EventDate:   domainEvent.EventDate,
		EndDate:     domainEvent.EndDate,
		AllDay:      domainEvent.AllDay,
		Location:    domainEvent.Location,
		CreatedAt:   domainEvent.CreatedAt,
		UpdatedAt:   domainEvent.UpdatedAt,
	}

	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return fmt.Errorf("failed to create event: %w", err)
	}

	return nil
}

func (r *EventRepository) GetByID(ctx context.Context, id string) (*event.Event, error) {
	var model models.Event

	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("event not found")
		}
		return nil, fmt.Errorf("failed to get event: %w", err)
	}

	return r.modelToDomain(&model), nil
}

func (r *EventRepository) GetByUserID(ctx context.Context, userID string) ([]*event.Event, error) {
	var models []models.Event

	if err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("event_date DESC").
		Find(&models).Error; err != nil {
		return nil, fmt.Errorf("failed to get events: %w", err)
	}

	events := make([]*event.Event, len(models))
	for i, m := range models {
		events[i] = r.modelToDomain(&m)
	}

	return events, nil
}

func (r *EventRepository) GetByUserIDAndDateRange(ctx context.Context, userID string, startDate, endDate time.Time) ([]*event.Event, error) {
	var models []models.Event

	if err := r.db.WithContext(ctx).
		Where("user_id = ? AND event_date >= ? AND event_date <= ?", userID, startDate, endDate).
		Order("event_date ASC").
		Find(&models).Error; err != nil {
		return nil, fmt.Errorf("failed to get events: %w", err)
	}

	events := make([]*event.Event, len(models))
	for i, m := range models {
		events[i] = r.modelToDomain(&m)
	}

	return events, nil
}

func (r *EventRepository) Update(ctx context.Context, domainEvent *event.Event) error {
	model := &models.Event{
		ID:          domainEvent.ID,
		UserID:      domainEvent.UserID,
		Title:       domainEvent.Title,
		Description: domainEvent.Description,
		Category:    string(domainEvent.Category),
		EventDate:   domainEvent.EventDate,
		EndDate:     domainEvent.EndDate,
		AllDay:      domainEvent.AllDay,
		Location:    domainEvent.Location,
		UpdatedAt:   domainEvent.UpdatedAt,
	}

	if err := r.db.WithContext(ctx).Save(model).Error; err != nil {
		return fmt.Errorf("failed to update event: %w", err)
	}

	return nil
}

func (r *EventRepository) Delete(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).Delete(&models.Event{}, "id = ?", id)

	if result.Error != nil {
		return fmt.Errorf("failed to delete event: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("event not found")
	}

	return nil
}

func (r *EventRepository) modelToDomain(model *models.Event) *event.Event {
	return &event.Event{
		ID:          model.ID,
		UserID:      model.UserID,
		Title:       model.Title,
		Description: model.Description,
		Category:    event.EventCategory(model.Category),
		EventDate:   model.EventDate,
		EndDate:     model.EndDate,
		AllDay:      model.AllDay,
		Location:    model.Location,
		CreatedAt:   model.CreatedAt,
		UpdatedAt:   model.UpdatedAt,
	}
}
