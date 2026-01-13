package event

import (
	"errors"
	"time"
)

// Event represents a calendar event in the domain
type Event struct {
	ID          string
	UserID      string
	Title       string
	Description string
	Category    EventCategory
	EventDate   time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type EventCategory string

const (
	CategoryDate      EventCategory = "date"
	CategoryFun       EventCategory = "fun"
	CategoryMilestone EventCategory = "milestone"
	CategoryTask      EventCategory = "task"
	CategoryActivity  EventCategory = "activity"
)

// NewEvent creates a new event with validation
func NewEvent(userID, title, description string, category EventCategory, eventDate time.Time) (*Event, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}
	
	if title == "" {
		return nil, errors.New("title is required")
	}
	
	if len(title) > 200 {
		return nil, errors.New("title cannot exceed 200 characters")
	}
	
	if len(description) > 1000 {
		return nil, errors.New("description cannot exceed 1000 characters")
	}
	
	if !isValidCategory(category) {
		return nil, errors.New("invalid category")
	}
	
	now := time.Now()
	return &Event{
		UserID:      userID,
		Title:       title,
		Description: description,
		Category:    category,
		EventDate:   eventDate,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

// Update updates the event fields with validation
func (e *Event) Update(title, description string, category EventCategory, eventDate time.Time) error {
	if title == "" {
		return errors.New("title is required")
	}
	
	if len(title) > 200 {
		return errors.New("title cannot exceed 200 characters")
	}
	
	if len(description) > 1000 {
		return errors.New("description cannot exceed 1000 characters")
	}
	
	if !isValidCategory(category) {
		return errors.New("invalid category")
	}
	
	e.Title = title
	e.Description = description
	e.Category = category
	e.EventDate = eventDate
	e.UpdatedAt = time.Now()
	
	return nil
}

func isValidCategory(category EventCategory) bool {
	switch category {
	case CategoryDate, CategoryFun, CategoryMilestone, CategoryTask, CategoryActivity:
		return true
	default:
		return false
	}
}
