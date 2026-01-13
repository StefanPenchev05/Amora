package mood

import (
	"errors"
	"time"
)

// Mood represents a mood entry in the domain
type Mood struct {
	ID        string
	UserID    string
	Level     MoodLevel
	Note      string
	MoodDate  time.Time
	CreatedAt time.Time
	UpdatedAt time.Time
}

type MoodLevel int

const (
	MoodVerySad   MoodLevel = 1
	MoodSad       MoodLevel = 2
	MoodNeutral   MoodLevel = 3
	MoodHappy     MoodLevel = 4
	MoodVeryHappy MoodLevel = 5
)

// NewMood creates a new mood entry with validation
func NewMood(userID string, level MoodLevel, note string, moodDate time.Time) (*Mood, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}

	if !isValidMoodLevel(level) {
		return nil, errors.New("invalid mood level")
	}

	if len(note) > 500 {
		return nil, errors.New("note cannot exceed 500 characters")
	}

	now := time.Now()
	return &Mood{
		UserID:    userID,
		Level:     level,
		Note:      note,
		MoodDate:  moodDate,
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

// Update updates the mood entry with validation
func (m *Mood) Update(level MoodLevel, note string) error {
	if !isValidMoodLevel(level) {
		return errors.New("invalid mood level")
	}

	if len(note) > 500 {
		return errors.New("note cannot exceed 500 characters")
	}

	m.Level = level
	m.Note = note
	m.UpdatedAt = time.Now()

	return nil
}

func isValidMoodLevel(level MoodLevel) bool {
	return level >= MoodVerySad && level <= MoodVeryHappy
}
