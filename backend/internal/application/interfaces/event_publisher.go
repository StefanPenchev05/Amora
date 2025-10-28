package interfaces

import (
	"context"

	"github.com/StefanPenchev05/Amora/backend/internal/domain/user"
)

type EventPublisher interface {
	PublishEvents(ctx context.Context, event ...user.DomainEvent) error
}
