package models

import "time"

type User struct {
	ID        string    `gorm:"type:char(36);primaryKey;column:id;default:(uuid())" json:"id"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`

	Credentials Credentials `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:UserID;references:ID"`
	Profile     Profile     `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:UserID;references:ID"`
	Session     []Session   `gorm:"foreignKey:UserID;references:ID"`
}

type Credentials struct {
	UserID string `gorm:"type:char(36);primaryKey;column:user_id"`
	User   *User  `gorm:"foreignKey:UserID;references:ID" json:"-"`

	Email         string     `gorm:"column:email;size:320;unique;not null;index" json:"email"`
	Password      string     `gorm:"column:password;size:255;not null;->:false;<-:create" json:"-"`
	Username      string     `gorm:"column:username;size:50;unique;not null;index" json:"username"`
	EmailVerified bool       `gorm:"column:email_verified;not null;default:false" json:"email_verified"`
	MfaEnabled    bool       `gorm:"column:mfa_enabled;not null;default:false" json:"mfa_enabled"`
	MfaSecret     *string    `gorm:"column:mfa_secret;size:64" json:"mfa_secret,omitempty"`
	LastLoginAt   *time.Time `gorm:"column:last_login_at" json:"last_login_at,omitempty"`
}

type Profile struct {
	UserID string `gorm:"type:char(36);primaryKey;column:user_id"`
	User   *User  `gorm:"foreignKey:UserID;references:ID"`

	FirstName      string     `gorm:"column:first_name;size:100;not null" json:"first_name"`
	LastName       string     `gorm:"column:last_name;size:100;not null" json:"last_name"`
	Gender         Gender     `gorm:"type:genders;not null;default:prefer_not_to_say" json:"gender"`
	DateOfBirth    *time.Time `gorm:"column:date_of_birth;type:date" json:"date_of_birth,omitempty"`
	Bio            *string    `gorm:"column:bio;size:500" json:"bio,omitempty"`
	DisplayName    *string    `gorm:"column:display_name;size:100;index" json:"display_name,omitempty"`
	AvatarPhotoID  *string    `gorm:"column:avatar_photo_id;type:char(36)" json:"avatar_photo_id,omitempty"`
	RelationshipID *string    `gorm:"column:relationship_id;type:char(36);index" json:"relationship_id,omitempty"`
	Locale         string     `gorm:"column:locale;size:10;not null;default:'en'" json:"locale"`
	Timezone       string     `gorm:"column:timezone;size:50;not null;default:'UTC'" json:"timezone"`
}
type Session struct {
	ID           string     `gorm:"type:char(36);primaryKey;column:id;default:(uuid())" json:"id"`
	UserID       string     `gorm:"type:char(36);not null;column:user_id;index:idx_sessions_user_active;index:idx_sessions_user_revoked" json:"user_id"`
	UserAgent    *string    `gorm:"column:user_agent;size:512" json:"user_agent,omitempty"`
	IPAddress    *string    `gorm:"column:ip_address;size:45;index" json:"ip_address,omitempty"`
	CreatedAt    time.Time  `gorm:"column:created_at;not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	LastUsedAt   time.Time  `gorm:"column:last_used_at;not null;default:CURRENT_TIMESTAMP;index:idx_sessions_user_active;index:idx_sessions_cleanup" json:"last_used_at"`
	RevokedAt    *time.Time `gorm:"column:revoked_at;index:idx_sessions_user_revoked" json:"revoked_at,omitempty"`
	TokenVersion int        `gorm:"column:token_version;not null;default:0" json:"token_version"`

	User          User           `gorm:"foreignKey:UserID;references:ID"`
	RefreshTokens []RefreshToken `gorm:"foreignKey:SessionID;references:ID"`
}

type RefreshToken struct {
	ID        string     `gorm:"type:char(36);primaryKey;column:id;default:(uuid())" json:"id"`
	SessionID string     `gorm:"type:char(36);not null;column:session_id" json:"session_id"`
	JTI       string     `gorm:"type:char(36);not null;unique;column:jti;default:(uuid())" json:"jti"`
	FamilyID  string     `gorm:"type:char(36);not null;column:family_id;default:(uuid())" json:"family_id"`
	TokenHash string     `gorm:"column:token_hash;size:255;not null;index" json:"-"`
	ExpiresAt time.Time  `gorm:"column:expires_at;not null" json:"expires_at"`
	CreatedAt time.Time  `gorm:"column:created_at;not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	RotatedAt *time.Time `gorm:"column:rotated_at" json:"rotated_at,omitempty"`
	RevokedAt *time.Time `gorm:"column:revoked_at" json:"revoked_at,omitempty"`
	Reason    *string    `gorm:"column:reason;size:255" json:"reason,omitempty"`

	Session Session `gorm:"foreignKey:SessionID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
}
