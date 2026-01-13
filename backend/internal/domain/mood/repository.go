package mood

import (
	"context"
	"time"
)

type Repository interface {
	Create(ctx context.Context, mood *Mood) error
	GetByID(ctx context.Context, id string) (*Mood, error)
	GetByUserID(ctx context.Context, userID string) ([]*Mood, error)
	GetByUserIDAndDateRange(ctx context.Context, userID string, startDate, endDate time.Time) ([]*Mood, error)
	Update(ctx context.Context, mood *Mood) error
	Delete(ctx context.Context, id string) error
}
