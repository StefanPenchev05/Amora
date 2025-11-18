package handlers

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/StefanPenchev05/Amora/backend/internal/container"
	dtoUser "github.com/StefanPenchev05/Amora/backend/internal/presentation/http/dto/user"
)

type AuthHandler struct {
	container *container.Container
	logger    *slog.Logger
}

func NewAuthHandler(container *container.Container, logger *slog.Logger) *AuthHandler {
	return &AuthHandler{
		container: container,
		logger:    logger,
	}
}

// Register handles user registration
// POST /auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var req dtoUser.CreateUserRequest

	// Bind and validate request
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid registration request", "error", err)
		c.JSON(http.StatusBadRequest, dtoUser.ValidationErrorResponse{
			Error:  "validation_error",
			Fields: parseValidationErrors(err),
		})
		return
	}

	h.logger.Info("Registration attempt", "email", req.Email, "username", req.Username)

	// Execute the use case
	useCase := h.container.GetCreateUserUseCase()
	output, err := useCase.Execute(c.Request.Context(), req)
	if err != nil {
		switch err.Error() {
		case "email is already registered":
			c.JSON(http.StatusConflict, dtoUser.ErrorResponse{
				Error:   "email_exists",
				Message: "An account with this email already exists",
			})

		case "username is already taken":
			c.JSON(http.StatusConflict, dtoUser.ErrorResponse{
				Error:   "username_exists",
				Message: "This username is already taken",
			})

		default:
			c.JSON(http.StatusInternalServerError, dtoUser.ErrorResponse{
				Error:   "registration_failed",
				Message: "Failed to create account. Please try again.",
			})
		}
		return
	}

	h.logger.Info("User registered successfully",
		"user_id", output.ID,
		"email", req.Email,
		"username", req.Username,
	)

	c.JSON(http.StatusCreated, output)
}

func parseValidationErrors(err error) map[string]string {
	return map[string]string{
		"validation": err.Error(),
	}
}
