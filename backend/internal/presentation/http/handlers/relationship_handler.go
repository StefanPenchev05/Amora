package handlers

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"log/slog"
	"math/big"
	"net/http"
	"strings"

	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql/models"
	"github.com/StefanPenchev05/Amora/backend/internal/presentation/http/dto"
	"gorm.io/gorm"
)

type RelationshipHandler struct {
	db     *gorm.DB
	logger *slog.Logger
}

func NewRelationshipHandler(db *gorm.DB, logger *slog.Logger) *RelationshipHandler {
	return &RelationshipHandler{db: db, logger: logger}
}

type RelationshipStatusResponse struct {
	RelationshipID *string `json:"relationship_id,omitempty"`
	Status         string  `json:"status"`
	InviteCode     *string `json:"invite_code,omitempty"`
	Partner        *struct {
		UserID   string `json:"user_id"`
		Email    string `json:"email"`
		Username string `json:"username"`
		FullName string `json:"full_name"`
	} `json:"partner,omitempty"`
}

type AcceptInviteRequest struct {
	Code string `json:"code"`
}

// GET /api/relationship
func (h *RelationshipHandler) GetStatus(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized", Message: "User not authenticated"})
		return
	}

	var profile models.Profile
	if err := h.db.First(&profile, "user_id = ?", userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			respondJSON(w, http.StatusOK, RelationshipStatusResponse{Status: "none"})
			return
		}
		h.logger.Error("Failed to load profile", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "fetch_failed", Message: "Failed to fetch relationship"})
		return
	}

	if profile.RelationshipID == nil || *profile.RelationshipID == "" {
		respondJSON(w, http.StatusOK, RelationshipStatusResponse{Status: "none"})
		return
	}

	relID := *profile.RelationshipID
	var rel models.Relationship
	if err := h.db.First(&rel, "id = ?", relID).Error; err != nil {
		// If the relationship record is missing, treat as not connected.
		respondJSON(w, http.StatusOK, RelationshipStatusResponse{Status: "none"})
		return
	}

	resp := RelationshipStatusResponse{RelationshipID: &relID, Status: string(rel.Status)}
	if rel.Status == models.RelationshipPending && rel.UserAID == userID {
		code := rel.InviteCode
		resp.InviteCode = &code
	}

	if rel.Status == models.RelationshipActive {
		partnerID := ""
		if rel.UserAID == userID && rel.UserBID != nil {
			partnerID = *rel.UserBID
		} else if rel.UserBID != nil && *rel.UserBID == userID {
			partnerID = rel.UserAID
		}

		if partnerID != "" {
			type userRow struct {
				ID       string
				Email    string
				Username string
				FullName string
			}
			var row userRow
			err := h.db.Table("users").
				Select("users.id as id, credentials.email as email, credentials.username as username, CONCAT(profiles.first_name, ' ', profiles.last_name) as full_name").
				Joins("JOIN credentials ON credentials.user_id = users.id").
				Joins("JOIN profiles ON profiles.user_id = users.id").
				Where("users.id = ?", partnerID).
				Scan(&row).Error
			if err == nil && row.ID != "" {
				resp.Partner = &struct {
					UserID   string `json:"user_id"`
					Email    string `json:"email"`
					Username string `json:"username"`
					FullName string `json:"full_name"`
				}{UserID: row.ID, Email: row.Email, Username: row.Username, FullName: row.FullName}
			}
		}
	}

	respondJSON(w, http.StatusOK, resp)
}

// POST /api/relationship/invite
func (h *RelationshipHandler) CreateInvite(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized", Message: "User not authenticated"})
		return
	}

	var profile models.Profile
	if err := h.db.First(&profile, "user_id = ?", userID).Error; err != nil {
		h.logger.Error("Failed to load profile", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "fetch_failed", Message: "Failed to create invite"})
		return
	}

	// If user already has a relationship, return it.
	if profile.RelationshipID != nil && *profile.RelationshipID != "" {
		var rel models.Relationship
		if err := h.db.First(&rel, "id = ?", *profile.RelationshipID).Error; err == nil {
			resp := RelationshipStatusResponse{RelationshipID: profile.RelationshipID, Status: string(rel.Status)}
			if rel.Status == models.RelationshipPending && rel.UserAID == userID {
				code := rel.InviteCode
				resp.InviteCode = &code
			}
			respondJSON(w, http.StatusOK, resp)
			return
		}
	}

	code, err := h.generateUniqueInviteCode()
	if err != nil {
		h.logger.Error("Failed to generate invite code", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "invite_failed", Message: "Failed to create invite"})
		return
	}

	rel := models.Relationship{Status: models.RelationshipPending, InviteCode: code, UserAID: userID}
	if err := h.db.Create(&rel).Error; err != nil {
		h.logger.Error("Failed to create relationship", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "invite_failed", Message: "Failed to create invite"})
		return
	}

	if err := h.db.Model(&models.Profile{}).Where("user_id = ?", userID).Update("relationship_id", rel.ID).Error; err != nil {
		h.logger.Error("Failed to update profile relationship_id", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "invite_failed", Message: "Failed to create invite"})
		return
	}

	resp := RelationshipStatusResponse{RelationshipID: &rel.ID, Status: string(rel.Status)}
	resp.InviteCode = &rel.InviteCode
	respondJSON(w, http.StatusOK, resp)
}

// POST /api/relationship/accept
func (h *RelationshipHandler) AcceptInvite(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized", Message: "User not authenticated"})
		return
	}

	var req AcceptInviteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{Error: "invalid_request", Message: "Invalid request body"})
		return
	}
	code := strings.ToUpper(strings.TrimSpace(req.Code))
	if code == "" {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{Error: "validation_error", Message: "Invite code is required"})
		return
	}

	var myProfile models.Profile
	if err := h.db.First(&myProfile, "user_id = ?", userID).Error; err != nil {
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "fetch_failed", Message: "Failed to accept invite"})
		return
	}
	if myProfile.RelationshipID != nil && *myProfile.RelationshipID != "" {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{Error: "already_connected", Message: "You are already connected"})
		return
	}

	var rel models.Relationship
	if err := h.db.First(&rel, "invite_code = ?", code).Error; err != nil {
		respondJSON(w, http.StatusNotFound, dto.ErrorResponse{Error: "not_found", Message: "Invalid invite code"})
		return
	}

	if rel.Status != models.RelationshipPending || rel.UserBID != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{Error: "invalid_invite", Message: "Invite is no longer valid"})
		return
	}
	if rel.UserAID == userID {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{Error: "invalid_invite", Message: "You can't accept your own invite"})
		return
	}

	// Transaction: claim relationship + update both profiles.
	err := h.db.Transaction(func(tx *gorm.DB) error {
		rel.UserBID = &userID
		rel.Status = models.RelationshipActive
		if err := tx.Save(&rel).Error; err != nil {
			return err
		}
		if err := tx.Model(&models.Profile{}).Where("user_id = ?", rel.UserAID).Update("relationship_id", rel.ID).Error; err != nil {
			return err
		}
		if err := tx.Model(&models.Profile{}).Where("user_id = ?", userID).Update("relationship_id", rel.ID).Error; err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		h.logger.Error("Failed to accept invite", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "accept_failed", Message: "Failed to accept invite"})
		return
	}

	relID := rel.ID
	respondJSON(w, http.StatusOK, RelationshipStatusResponse{RelationshipID: &relID, Status: string(rel.Status)})
}

func (h *RelationshipHandler) generateUniqueInviteCode() (string, error) {
	// 8 chars, readable, uppercase.
	alphabet := "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no 0/1/I/O
	for attempt := 0; attempt < 8; attempt++ {
		b := make([]byte, 8)
		for i := range b {
			n, err := rand.Int(rand.Reader, big.NewInt(int64(len(alphabet))))
			if err != nil {
				return "", err
			}
			b[i] = alphabet[n.Int64()]
		}
		code := string(b)

		var count int64
		if err := h.db.Model(&models.Relationship{}).Where("invite_code = ?", code).Count(&count).Error; err != nil {
			return "", err
		}
		if count == 0 {
			return code, nil
		}
	}
	return "", errors.New("failed to generate unique invite code")
}
