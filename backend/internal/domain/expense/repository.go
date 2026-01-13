package expense

import (
	"context"
	"time"
)

type Repository interface {
	Create(ctx context.Context, expense *Expense) error
	GetByID(ctx context.Context, id string) (*Expense, error)
	GetByUserID(ctx context.Context, userID string) ([]*Expense, error)
	GetByUserIDAndDateRange(ctx context.Context, userID string, startDate, endDate time.Time) ([]*Expense, error)
	Update(ctx context.Context, expense *Expense) error
	Delete(ctx context.Context, id string) error
}
