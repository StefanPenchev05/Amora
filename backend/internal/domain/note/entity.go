package note

import (
	"errors"
	"time"
)

// Note represents a note in the domain
type Note struct {
	ID        string
	UserID    string
	Title     string
	Content   string
	Color     NoteColor
	IsPinned  bool
	CreatedAt time.Time
	UpdatedAt time.Time
}

type NoteColor string

const (
	ColorDefault NoteColor = "default"
	ColorRed     NoteColor = "red"
	ColorBlue    NoteColor = "blue"
	ColorGreen   NoteColor = "green"
	ColorYellow  NoteColor = "yellow"
	ColorPurple  NoteColor = "purple"
	ColorPink    NoteColor = "pink"
)

// NewNote creates a new note with validation
func NewNote(userID, title, content string, color NoteColor) (*Note, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}
	
	if title == "" {
		return nil, errors.New("title is required")
	}
	
	if len(title) > 200 {
		return nil, errors.New("title cannot exceed 200 characters")
	}
	
	if len(content) > 5000 {
		return nil, errors.New("content cannot exceed 5000 characters")
	}
	
	if !isValidColor(color) {
		return nil, errors.New("invalid color")
	}
	
	now := time.Now()
	return &Note{
		UserID:    userID,
		Title:     title,
		Content:   content,
		Color:     color,
		IsPinned:  false,
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

// Update updates the note with validation
func (n *Note) Update(title, content string, color NoteColor) error {
	if title == "" {
		return errors.New("title is required")
	}
	
	if len(title) > 200 {
		return errors.New("title cannot exceed 200 characters")
	}
	
	if len(content) > 5000 {
		return errors.New("content cannot exceed 5000 characters")
	}
	
	if !isValidColor(color) {
		return errors.New("invalid color")
	}
	
	n.Title = title
	n.Content = content
	n.Color = color
	n.UpdatedAt = time.Now()
	
	return nil
}

// TogglePin toggles the pinned status of the note
func (n *Note) TogglePin() {
	n.IsPinned = !n.IsPinned
	n.UpdatedAt = time.Now()
}

func isValidColor(color NoteColor) bool {
	switch color {
	case ColorDefault, ColorRed, ColorBlue, ColorGreen, ColorYellow, ColorPurple, ColorPink:
		return true
	default:
		return false
	}
}
