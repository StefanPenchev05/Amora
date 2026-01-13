package memory

import "context"

type Repository interface {
	Create(ctx context.Context, memory *Memory) error
	GetByID(ctx context.Context, id string) (*Memory, error)
	GetByUserID(ctx context.Context, userID string) ([]*Memory, error)
	GetByUserIDAndCategory(ctx context.Context, userID string, category MemoryCategory) ([]*Memory, error)
	Update(ctx context.Context, memory *Memory) error
	Delete(ctx context.Context, id string) error
}
