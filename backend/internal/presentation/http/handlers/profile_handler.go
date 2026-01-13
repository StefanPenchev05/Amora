package handlers

import (
	"errors"
	"net/http"

	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql/models"
	dtoUser "github.com/StefanPenchev05/Amora/backend/internal/presentation/http/dto/user"
	"gorm.io/gorm"
)

type ProfileHandler struct {
	db *gorm.DB
}

func NewProfileHandler(db *gorm.DB) *ProfileHandler {
	return &ProfileHandler{db: db}
}

type UpdateAvatarResponse struct {
	AvatarPhotoID *string `json:"avatar_photo_id,omitempty"`
	AvatarURL     *string `json:"avatar_url,omitempty"`
}

// UpdateAvatar updates the current user's avatar.
// POST /api/profile/avatar
func (h *ProfileHandler) UpdateAvatar(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dtoUser.ErrorResponse{
			Error:   "unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, maxRegisterBodyBytes)
	if err := r.ParseMultipartForm(maxRegisterBodyBytes); err != nil {
		respondJSON(w, http.StatusBadRequest, dtoUser.ErrorResponse{
			Error:   "invalid_request",
			Message: invalidRequestBodyMessage,
		})
		return
	}

	file, header, err := r.FormFile("avatar")
	if err != nil {
		if errors.Is(err, http.ErrMissingFile) {
			respondJSON(w, http.StatusBadRequest, dtoUser.ErrorResponse{
				Error:   "validation_error",
				Message: "Missing avatar file",
			})
			return
		}
		respondJSON(w, http.StatusBadRequest, dtoUser.ErrorResponse{
			Error:   "invalid_request",
			Message: invalidRequestBodyMessage,
		})
		return
	}
	defer file.Close()

	avatarPhotoID, err := saveAvatarUpload(file, header)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, dtoUser.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	res := h.db.Model(&models.Profile{}).
		Where("user_id = ?", userID).
		Update("avatar_photo_id", avatarPhotoID)
	if res.Error != nil {
		respondJSON(w, http.StatusInternalServerError, dtoUser.ErrorResponse{
			Error:   "update_failed",
			Message: "Failed to update avatar",
		})
		return
	}
	if res.RowsAffected == 0 {
		respondJSON(w, http.StatusNotFound, dtoUser.ErrorResponse{
			Error:   "not_found",
			Message: "Profile not found",
		})
		return
	}

	respondJSON(w, http.StatusOK, UpdateAvatarResponse{
		AvatarPhotoID: &avatarPhotoID,
		AvatarURL:     dtoUser.AvatarURLFromPhotoID(&avatarPhotoID),
	})
}
