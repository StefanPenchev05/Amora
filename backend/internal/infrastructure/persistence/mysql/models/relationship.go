package models

import "time"

type RelationshipStatus string

const (
  RelationshipPending RelationshipStatus = "pending"
  RelationshipActive  RelationshipStatus = "active"
)

// Relationship represents a connection between two users.
// When created, UserAID is the inviter and UserBID is null until accepted.
type Relationship struct {
  ID        string    `gorm:"type:char(36);primaryKey;column:id;default:(uuid())" json:"id"`
  CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
  UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`

  Status     RelationshipStatus `gorm:"type:varchar(20);not null;default:'pending';index" json:"status"`
  InviteCode string             `gorm:"column:invite_code;size:32;unique;not null;index" json:"invite_code"`

  UserAID string  `gorm:"type:char(36);not null;column:user_a_id;index" json:"user_a_id"`
  UserBID *string `gorm:"type:char(36);column:user_b_id;index" json:"user_b_id,omitempty"`
}
