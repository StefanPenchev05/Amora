package event

import (
	"context"
	"time"
)

type Repository interface {
	Create(ctx context.Context, event *Event) error
	GetByID(ctx context.Context, id string) (*Event, error)
	GetByUserID(ctx context.Context, userID string) ([]*Event, error)
	GetByUserIDAndDateRange(ctx context.Context, userID string, startDate, endDate time.Time) ([]*Event, error)
	Update(ctx context.Context, event *Event) error
	Delete(ctx context.Context, id string) error
}
