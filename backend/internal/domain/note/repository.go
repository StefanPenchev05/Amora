package note

import "context"

type Repository interface {
	Create(ctx context.Context, note *Note) error
	GetByID(ctx context.Context, id string) (*Note, error)
	GetByUserID(ctx context.Context, userID string) ([]*Note, error)
	Update(ctx context.Context, note *Note) error
	Delete(ctx context.Context, id string) error
}
