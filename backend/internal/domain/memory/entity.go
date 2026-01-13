package memory

import (
	"errors"
	"time"
)

// Memory represents a memory in the domain
type Memory struct {
	ID          string
	UserID      string
	Title       string
	Description string
	Category    MemoryCategory
	PhotoURL    string
	MemoryDate  time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type MemoryCategory string

const (
	CategoryTravel    MemoryCategory = "travel"
	CategoryMilestone MemoryCategory = "milestone"
	CategoryDate      MemoryCategory = "date"
	CategoryFun       MemoryCategory = "fun"
	CategoryCozy      MemoryCategory = "cozy"
)

var validCategories = map[MemoryCategory]bool{
	CategoryTravel:    true,
	CategoryMilestone: true,
	CategoryDate:      true,
	CategoryFun:       true,
	CategoryCozy:      true,
}

func (c MemoryCategory) IsValid() bool {
	return validCategories[c]
}

func NewMemory(userID, title, description string, category MemoryCategory, photoURL string, memoryDate time.Time) (*Memory, error) {
	if userID == "" {
		return nil, errors.New("user ID cannot be empty")
	}
	if title == "" {
		return nil, errors.New("title cannot be empty")
	}
	if description == "" {
		return nil, errors.New("description cannot be empty")
	}
	if !category.IsValid() {
		return nil, errors.New("invalid memory category")
	}

	now := time.Now()
	return &Memory{
		UserID:      userID,
		Title:       title,
		Description: description,
		Category:    category,
		PhotoURL:    photoURL,
		MemoryDate:  memoryDate,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

func (m *Memory) Update(title, description string, category MemoryCategory, photoURL string, memoryDate time.Time) error {
	if title == "" {
		return errors.New("title cannot be empty")
	}
	if description == "" {
		return errors.New("description cannot be empty")
	}
	if !category.IsValid() {
		return errors.New("invalid memory category")
	}

	m.Title = title
	m.Description = description
	m.Category = category
	m.PhotoURL = photoURL
	m.MemoryDate = memoryDate
	m.UpdatedAt = time.Now()

	return nil
}
