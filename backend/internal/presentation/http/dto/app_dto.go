package dto

import "time"

// Event DTOs
type CreateEventRequest struct {
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description"`
	Category    string    `json:"category" binding:"required"`
	EventDate   time.Time `json:"event_date" binding:"required"`
	EndDate     *time.Time `json:"end_date,omitempty"`
	AllDay      bool      `json:"all_day"`
	Location    string    `json:"location"`
}

type UpdateEventRequest struct {
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description"`
	Category    string    `json:"category" binding:"required"`
	EventDate   time.Time `json:"event_date" binding:"required"`
	EndDate     *time.Time `json:"end_date,omitempty"`
	AllDay      bool      `json:"all_day"`
	Location    string    `json:"location"`
}

type EventResponse struct {
	UserID      string    `json:"user_id"`
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	EventDate   time.Time `json:"event_date"`
	EndDate     *time.Time `json:"end_date,omitempty"`
	AllDay      bool      `json:"all_day"`
	Location    string    `json:"location"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Mood DTOs
type CreateMoodRequest struct {
	Level    int       `json:"level" binding:"required,min=1,max=5"`
	Note     string    `json:"note"`
	MoodDate time.Time `json:"mood_date" binding:"required"`
}

type UpdateMoodRequest struct {
	Level int    `json:"level" binding:"required,min=1,max=5"`
	Note  string `json:"note"`
}

type MoodResponse struct {
	UserID    string    `json:"user_id"`
	ID        string    `json:"id"`
	Level     int       `json:"level"`
	Note      string    `json:"note"`
	MoodDate  time.Time `json:"mood_date"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Note DTOs
type CreateNoteRequest struct {
	Title   string `json:"title" binding:"required"`
	Content string `json:"content"`
	Color   string `json:"color"`
}

type UpdateNoteRequest struct {
	Title   string `json:"title" binding:"required"`
	Content string `json:"content"`
	Color   string `json:"color"`
}

type NoteResponse struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Color     string    `json:"color"`
	IsPinned  bool      `json:"is_pinned"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Memory DTOs
type CreateMemoryRequest struct {
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description"`
	Category    string    `json:"category" binding:"required"`
	PhotoURL    string    `json:"photo_url"`
	MemoryDate  time.Time `json:"memory_date" binding:"required"`
}

type UpdateMemoryRequest struct {
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description"`
	Category    string    `json:"category" binding:"required"`
	PhotoURL    string    `json:"photo_url"`
	MemoryDate  time.Time `json:"memory_date" binding:"required"`
}

type MemoryResponse struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	PhotoURL    string    `json:"photo_url"`
	MemoryDate  time.Time `json:"memory_date"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Expense DTOs
type CreateExpenseRequest struct {
	Amount      float64   `json:"amount" binding:"required,gt=0"`
	Description string    `json:"description" binding:"required"`
	Category    string    `json:"category" binding:"required"`
	PaidBy      string    `json:"paid_by" binding:"required"`
	ExpenseDate time.Time `json:"expense_date" binding:"required"`
}

type UpdateExpenseRequest struct {
	Amount      float64   `json:"amount" binding:"required,gt=0"`
	Description string    `json:"description" binding:"required"`
	Category    string    `json:"category" binding:"required"`
	PaidBy      string    `json:"paid_by" binding:"required"`
	ExpenseDate time.Time `json:"expense_date" binding:"required"`
}

type ExpenseResponse struct {
	ID          string    `json:"id"`
	Amount      float64   `json:"amount"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	PaidBy      string    `json:"paid_by"`
	IsSettled   bool      `json:"is_settled"`
	ExpenseDate time.Time `json:"expense_date"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}
