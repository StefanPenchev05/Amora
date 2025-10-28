package user

import (
	"fmt"
	"time"
)

type DomainEvent interface {
	GetEventID() string
	GetEventType() string
	GetAggregateID() string
	GetOccurredAt() time.Time
	GetEventData() interface{}
}

// BaseEvent provides common event
type BaseEvent struct {
	EventID     string    `json:"event_id"`
	EventType   string    `json:"event_type"`
	AggregateID string    `json:"aggregate_id"`
	OccurredAt  time.Time `json:"occured_at"`
}

func (e BaseEvent) GetEventID() string       { return e.EventID }
func (e BaseEvent) GetEventType() string     { return e.EventType }
func (e BaseEvent) GetAggregateID() string   { return e.AggregateID }
func (e BaseEvent) GetOccurredAt() time.Time { return e.OccurredAt }

// UserCreatedEvent - fired when a new user is created
type UserCreatedEvent struct {
	BaseEvent
	Email     string `json:"email"`
	Username  string `json:"username"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

func NewUserCreatedEvent(userID, email, username, firstName, lastName string) *UserCreatedEvent {
	return &UserCreatedEvent{
		BaseEvent: BaseEvent{
			EventID:     generateEventID(),
			EventType:   "user.created",
			AggregateID: userID,
			OccurredAt:  time.Now(),
		},
		Email:     email,
		Username:  username,
		FirstName: firstName,
		LastName:  lastName,
	}
}

func (e UserCreatedEvent) GetEventData() interface{} { return e }

// UserLoggedInEvent - fired when user logs in
type UserLoggedInEvent struct {
	BaseEvent
	Email     string `json:"email"`
	Username  string `json:"username"`
	IPAddress string `json:"ip_address,omitempty"`
	UserAgent string `json:"user_agent,omitempty"`
}

func NewUserLoggedInEvent(userID, email, username, ipAddress, userAgent string) *UserLoggedInEvent {
	return &UserLoggedInEvent{
		BaseEvent: BaseEvent{
			EventID:     generateEventID(),
			EventType:   "user.logged_in",
			AggregateID: userID,
			OccurredAt:  time.Now(),
		},
		Email:     email,
		Username:  username,
		IPAddress: ipAddress,
		UserAgent: userAgent,
	}
}

type UserEmailVerifiedEvent struct {
	BaseEvent
}

func (e UserLoggedInEvent) GetEventData() interface{} { return e }

func NewUserEmailVerifiedEvent(userID, email string) *UserEmailVerifiedEvent {
	return &UserEmailVerifiedEvent{
		BaseEvent: BaseEvent{
			EventID:     generateEventID(),
			EventType:   fmt.Sprintf("%s.email_verified", email),
			AggregateID: userID,
			OccurredAt:  time.Now(),
		},
	}
}

func (e UserEmailVerifiedEvent) GetEventData() interface{} { return e }

// Helper Functions
func generateEventID() string {
	bytes := make([]byte, 8)

	timestamp := time.Now().UnixNano()
	return fmt.Sprintf("evt_%d_%x", timestamp, bytes)
}
