package handlers

import (
	"encoding/json"
	"bytes"
	"errors"
	"io"
	"log/slog"
	"mime"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/StefanPenchev05/Amora/backend/internal/container"
	dtoUser "github.com/StefanPenchev05/Amora/backend/internal/presentation/http/dto/user"
	"github.com/google/uuid"
)

type AuthHandler struct {
	container *container.Container
	logger    *slog.Logger
}

const invalidRequestBodyMessage = "Invalid request body"

const (
	maxRegisterBodyBytes = 12 << 20 // 12MB total request
	maxAvatarBytes       = 5 << 20  // 5MB avatar file
)

func NewAuthHandler(container *container.Container, logger *slog.Logger) *AuthHandler {
	return &AuthHandler{
		container: container,
		logger:    logger,
	}
}

// Register handles user registration
// POST /auth/register
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxRegisterBodyBytes)

	req, err := parseCreateUserRequest(r)
	if err != nil {
		h.logger.Error("Invalid registration request", "error", err)
		respondJSON(w, http.StatusBadRequest, dtoUser.ErrorResponse{
			Error:   "invalid_request",
			Message: invalidRequestBodyMessage,
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
	output, err := useCase.Execute(r.Context(), *req)
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

func parseCreateUserRequest(r *http.Request) (*dtoUser.CreateUserRequest, error) {
	ct := r.Header.Get("Content-Type")
	if strings.HasPrefix(strings.ToLower(ct), "multipart/form-data") {
		return parseMultipartCreateUserRequest(r)
	}

	var req dtoUser.CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return nil, err
	}
	return &req, nil
}

func parseMultipartCreateUserRequest(r *http.Request) (*dtoUser.CreateUserRequest, error) {
	// Parse form fields and optional file.
	if err := r.ParseMultipartForm(maxRegisterBodyBytes); err != nil {
		return nil, err
	}

	req := &dtoUser.CreateUserRequest{
		Email:     strings.TrimSpace(r.FormValue("email")),
		Username:  strings.TrimSpace(r.FormValue("username")),
		FirstName: strings.TrimSpace(r.FormValue("first_name")),
		LastName:  strings.TrimSpace(r.FormValue("last_name")),
		Password:  r.FormValue("password"),
	}

	file, header, err := r.FormFile("avatar")
	if err != nil {
		if errors.Is(err, http.ErrMissingFile) {
			return req, nil
		}
		return nil, err
	}
	defer file.Close()

	avatarPhotoID, err := saveAvatarUpload(file, header)
	if err != nil {
		return nil, err
	}
	req.AvatarPhotoID = &avatarPhotoID

	return req, nil
}

func saveAvatarUpload(file multipart.File, header *multipart.FileHeader) (string, error) {
	// Read first bytes to detect content type.
	head := make([]byte, 512)
	n, err := io.ReadFull(file, head)
	if err != nil && !errors.Is(err, io.ErrUnexpectedEOF) {
		return "", err
	}
	head = head[:n]
	contentType := http.DetectContentType(head)

	// Allow only common image types.
	var ext string
	switch contentType {
	case "image/jpeg":
		ext = ".jpg"
	case "image/png":
		ext = ".png"
	case "image/webp":
		ext = ".webp"
	default:
		// Try using the provided filename extension if content type was ambiguous.
		if header != nil {
			if parsedExt := strings.ToLower(filepath.Ext(header.Filename)); parsedExt != "" {
				if mt := mime.TypeByExtension(parsedExt); strings.HasPrefix(mt, "image/") {
					ext = parsedExt
				}
			}
		}
		if ext == "" {
			return "", errors.New("unsupported avatar image type")
		}
	}

	reader := io.MultiReader(bytes.NewReader(head), file)

	if err := os.MkdirAll("uploads/avatars", 0o755); err != nil {
		return "", err
	}

	filename := uuid.NewString() + ext
	outPath := filepath.Join("uploads", "avatars", filename)

	out, err := os.OpenFile(outPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0o644)
	if err != nil {
		return "", err
	}
	defer out.Close()

	// Enforce file size.
	limited := io.LimitReader(reader, maxAvatarBytes+1)
	written, err := io.Copy(out, limited)
	if err != nil {
		return "", err
	}
	if written > maxAvatarBytes {
		_ = os.Remove(outPath)
		return "", errors.New("avatar file too large")
	}

	return filename, nil
}

// Login handles user authentication
// POST /auth/login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req dtoUser.AuthenticateUserRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Error("Invalid login request", "error", err)
		respondJSON(w, http.StatusBadRequest, dtoUser.ErrorResponse{
			Error:   "invalid_request",
			Message: invalidRequestBodyMessage,
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

// RefreshToken refreshes the access token using a valid refresh token.
// POST /auth/refresh
func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req dtoUser.RefreshTokenRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Error("Invalid refresh request", "error", err)
		respondJSON(w, http.StatusBadRequest, dtoUser.ErrorResponse{
			Error:   "invalid_request",
			Message: invalidRequestBodyMessage,
		})
		return
	}

	refreshToken := req.RefreshToken
	if refreshToken == "" {
		refreshToken = req.RefreshToken2
	}
	if refreshToken == "" {
		respondJSON(w, http.StatusBadRequest, dtoUser.ErrorResponse{
			Error:   "validation_error",
			Message: "Missing refresh token",
		})
		return
	}

	jwtSvc := h.container.GetJWTService()
	accessToken, err := jwtSvc.RefreshAccessToken(refreshToken)
	if err != nil {
		h.logger.Warn("Refresh token failed", "error", err)
		respondJSON(w, http.StatusUnauthorized, dtoUser.ErrorResponse{
			Error:   "unauthorized",
			Message: "Invalid or expired refresh token",
		})
		return
	}

	expiresIn := jwtSvc.GetAccessTokenExpiration()
	respondJSON(w, http.StatusOK, dtoUser.RefreshTokenResponse{
		AccessToken: accessToken,
		TokenType:   "Bearer",
		ExpiresIn:   int(expiresIn),
	})
}

// respondJSON is a helper function to send JSON responses
func respondJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}
