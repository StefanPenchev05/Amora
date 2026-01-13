package user

// CreateUserRequest represents the input for user creation
type CreateUserRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Username  string `json:"username" binding:"required,min=3,max=30"`
	FirstName string `json:"first_name" binding:"required,max=50"`
	LastName  string `json:"last_name" binding:"required,max=50"`
	Password  string `json:"password" binding:"required,min=8"`
}

// AuthenticateRequest represents the login input
type AuthenticateUserRequest struct {
	EmailOrUsername string `json:"email_or_username" binding:"required"`
	Password        string `json:"password" binding:"required"`
	IPAddress       string `json:"ip_address,omitempty"`
	UserAgent       string `json:"user_agent,omitempty"`
}
