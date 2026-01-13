package models

import "time"

type Event struct {
	ID          string    `gorm:"type:char(36);primaryKey;column:id;default:(uuid())" json:"id"`
	UserID      string    `gorm:"type:char(36);not null;column:user_id;index" json:"user_id"`
	Title       string    `gorm:"column:title;size:200;not null" json:"title"`
	Description string    `gorm:"column:description;size:1000" json:"description"`
	Category    string    `gorm:"column:category;size:50;not null;index" json:"category"`
	EventDate   time.Time `gorm:"column:event_date;not null;index" json:"event_date"`
	CreatedAt   time.Time `gorm:"column:created_at;not null;autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at;not null;autoUpdateTime" json:"updated_at"`

	User User `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
}

type Mood struct {
	ID        string    `gorm:"type:char(36);primaryKey;column:id;default:(uuid())" json:"id"`
	UserID    string    `gorm:"type:char(36);not null;column:user_id;index" json:"user_id"`
	Level     int       `gorm:"column:level;not null" json:"level"`
	Note      string    `gorm:"column:note;size:500" json:"note"`
	MoodDate  time.Time `gorm:"column:mood_date;not null;index" json:"mood_date"`
	CreatedAt time.Time `gorm:"column:created_at;not null;autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at;not null;autoUpdateTime" json:"updated_at"`

	User User `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
}

type Note struct {
	ID        string    `gorm:"type:char(36);primaryKey;column:id;default:(uuid())" json:"id"`
	UserID    string    `gorm:"type:char(36);not null;column:user_id;index" json:"user_id"`
	Title     string    `gorm:"column:title;size:200;not null" json:"title"`
	Content   string    `gorm:"column:content;size:5000" json:"content"`
	Color     string    `gorm:"column:color;size:20;not null;default:'default'" json:"color"`
	IsPinned  bool      `gorm:"column:is_pinned;not null;default:false;index" json:"is_pinned"`
	CreatedAt time.Time `gorm:"column:created_at;not null;autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at;not null;autoUpdateTime" json:"updated_at"`

	User User `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
}

type Memory struct {
	ID          string    `gorm:"type:char(36);primaryKey;column:id;default:(uuid())" json:"id"`
	UserID      string    `gorm:"type:char(36);not null;column:user_id;index" json:"user_id"`
	Title       string    `gorm:"column:title;size:200;not null" json:"title"`
	Description string    `gorm:"column:description;size:1000" json:"description"`
	Category    string    `gorm:"column:category;size:50;not null;index" json:"category"`
	PhotoURL    string    `gorm:"column:photo_url;size:500" json:"photo_url"`
	MemoryDate  time.Time `gorm:"column:memory_date;not null;index" json:"memory_date"`
	CreatedAt   time.Time `gorm:"column:created_at;not null;autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at;not null;autoUpdateTime" json:"updated_at"`

	User User `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
}

type Expense struct {
	ID          string    `gorm:"type:char(36);primaryKey;column:id;default:(uuid())" json:"id"`
	UserID      string    `gorm:"type:char(36);not null;column:user_id;index" json:"user_id"`
	Amount      float64   `gorm:"column:amount;not null" json:"amount"`
	Description string    `gorm:"column:description;size:200;not null" json:"description"`
	Category    string    `gorm:"column:category;size:50;not null;index" json:"category"`
	PaidBy      string    `gorm:"column:paid_by;size:20;not null" json:"paid_by"`
	IsSettled   bool      `gorm:"column:is_settled;not null;default:false;index" json:"is_settled"`
	ExpenseDate time.Time `gorm:"column:expense_date;not null;index" json:"expense_date"`
	CreatedAt   time.Time `gorm:"column:created_at;not null;autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at;not null;autoUpdateTime" json:"updated_at"`

	User User `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
}
