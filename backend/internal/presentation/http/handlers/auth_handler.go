package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"

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
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req dtoUser.CreateUserRequest

	// Parse and validate request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Error("Invalid registration request", "error", err)
		respondJSON(w, http.StatusBadRequest, dtoUser.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	// Basic validation
	if req.Email == "" || req.Username == "" || req.Password == "" || req.FirstName == "" || req.LastName == "" {
		respondJSON(w, http.StatusBadRequest, dtoUser.ErrorResponse{
			Error:   "validation_error",
			Message: "Missing required fields",
		})
		return
	}

	h.logger.Info("Registration attempt", "email", req.Email, "username", req.Username)

	// Execute the use case
	useCase := h.container.GetCreateUserUseCase()
	output, err := useCase.Execute(r.Context(), req)
	if err != nil {
		h.logger.Error("Registration failed", "error", err)

		switch err.Error() {
		case "email is already registered":
			respondJSON(w, http.StatusConflict, dtoUser.ErrorResponse{
				Error:   "email_exists",
				Message: "An account with this email already exists",
			})

		case "username is already taken":
			respondJSON(w, http.StatusConflict, dtoUser.ErrorResponse{
				Error:   "username_exists",
				Message: "This username is already taken",
			})

		default:
			respondJSON(w, http.StatusInternalServerError, dtoUser.ErrorResponse{
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

	respondJSON(w, http.StatusCreated, output)
}

// Login handles user authentication
// POST /auth/login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req dtoUser.AuthenticateUserRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Error("Invalid login request", "error", err)
		respondJSON(w, http.StatusBadRequest, dtoUser.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	h.logger.Info("Login attempt", "identifier", req.EmailOrUsername)

	useCase := h.container.GetAuthenticateUserUseCase()
	output, err := useCase.Execute(r.Context(), req)
	if err != nil {
		h.logger.Error("Login failed", "error", err)

		respondJSON(w, http.StatusUnauthorized, dtoUser.ErrorResponse{
			Error:   "authentication_failed",
			Message: "Invalid credentials",
		})
		return
	}

	h.logger.Info("User logged in successfully", "username", output.User.Username)

	respondJSON(w, http.StatusOK, output)
}

// respondJSON is a helper function to send JSON responses
func respondJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}
