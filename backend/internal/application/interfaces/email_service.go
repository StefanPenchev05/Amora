package interfaces

import "context"

// EmailService interface for email operations
type EmailService interface {
	SendWelcomeEmail(ctx context.Context, email, firstName string) error
	SendEmailVerification(ctx context.Context, email, token string) error
	SendPasswordResetEmail(ctx context.Context, email, token string) error
}
