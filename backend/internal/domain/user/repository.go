package user

import "context"

type Repository interface {
	Create(ctx context.Context, user *User) error
	GetByID(ctx context.Context, id string) (*User, error)
	GetByEmail(ctx context.Context, email Email) (*User, error)
	GetByUsername(ctx context.Context, username Username) (*User, error)
	Update(ctx context.Context, user *User) error
	DeleteByID(ctx context.Context, id string) error
	Exists(ctx context.Context, email Email, username Username) (bool, error)
}
