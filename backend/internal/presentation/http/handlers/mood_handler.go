package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"sort"
	"time"

	"github.com/StefanPenchev05/Amora/backend/internal/domain/mood"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql/models"
	"github.com/StefanPenchev05/Amora/backend/internal/presentation/http/dto"
	"gorm.io/gorm"
)

type MoodHandler struct {
	db     *gorm.DB
	repo   mood.Repository
	logger *slog.Logger
}

func NewMoodHandler(db *gorm.DB, logger *slog.Logger) *MoodHandler {
	return &MoodHandler{
		db:     db,
		repo:   mysql.NewMoodRepository(db),
		logger: logger,
	}
}

func (h *MoodHandler) sharedUserIDs(ctxUserID string) []string {
	// Default: only the current user's items.
	ids := []string{ctxUserID}
	if h.db == nil || ctxUserID == "" {
		return ids
	}

	var profile models.Profile
	if err := h.db.First(&profile, "user_id = ?", ctxUserID).Error; err != nil {
		return ids
	}
	if profile.RelationshipID == nil || *profile.RelationshipID == "" {
		return ids
	}

	var rel models.Relationship
	if err := h.db.First(&rel, "id = ?", *profile.RelationshipID).Error; err != nil {
		return ids
	}
	if rel.Status != models.RelationshipActive {
		return ids
	}

	partnerID := ""
	if rel.UserAID == ctxUserID && rel.UserBID != nil {
		partnerID = *rel.UserBID
	} else if rel.UserBID != nil && *rel.UserBID == ctxUserID {
		partnerID = rel.UserAID
	}
	if partnerID == "" {
		return ids
	}
	return []string{ctxUserID, partnerID}
}

func (h *MoodHandler) CreateMood(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized", Message: "User not authenticated"})
		return
	}
	var req dto.CreateMoodRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{Error: "invalid_request", Message: "Invalid request body"})
		return
	}

	domainMood, err := mood.NewMood(userID, mood.MoodLevel(req.Level), req.Note, req.MoodDate)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{Error: "validation_error", Message: err.Error()})
		return
	}

	if err := h.repo.Create(r.Context(), domainMood); err != nil {
		h.logger.Error("Failed to create mood", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "creation_failed", Message: "Failed to create mood"})
		return
	}

	respondJSON(w, http.StatusCreated, dto.MoodResponse{
		UserID: domainMood.UserID,
		ID:     domainMood.ID, Level: int(domainMood.Level), Note: domainMood.Note,
		MoodDate: domainMood.MoodDate, CreatedAt: domainMood.CreatedAt, UpdatedAt: domainMood.UpdatedAt,
	})
}

func (h *MoodHandler) GetMoods(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized", Message: "User not authenticated"})
		return
	}
	startDateStr, endDateStr := r.URL.Query().Get("start_date"), r.URL.Query().Get("end_date")
	userIDs := h.sharedUserIDs(userID)

	var combined []*mood.Mood
	for _, uid := range userIDs {
		var items []*mood.Mood
		var err error
		if startDateStr != "" && endDateStr != "" {
			startDate, _ := time.Parse("2006-01-02", startDateStr)
			endDate, _ := time.Parse("2006-01-02", endDateStr)
			items, err = h.repo.GetByUserIDAndDateRange(r.Context(), uid, startDate, endDate)
		} else {
			items, err = h.repo.GetByUserID(r.Context(), uid)
		}
		if err != nil {
			h.logger.Error("Failed to get moods", "error", err)
			respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "fetch_failed", Message: "Failed to fetch moods"})
			return
		}
		combined = append(combined, items...)
	}

	sort.SliceStable(combined, func(i, j int) bool {
		if combined[i].MoodDate.Equal(combined[j].MoodDate) {
			return combined[i].CreatedAt.After(combined[j].CreatedAt)
		}
		return combined[i].MoodDate.After(combined[j].MoodDate)
	})

	responses := make([]dto.MoodResponse, len(combined))
	for i, m := range combined {
		responses[i] = dto.MoodResponse{
			UserID: m.UserID,
			ID:     m.ID, Level: int(m.Level), Note: m.Note, MoodDate: m.MoodDate, CreatedAt: m.CreatedAt, UpdatedAt: m.UpdatedAt,
		}
	}

	respondJSON(w, http.StatusOK, responses)
}

func (h *MoodHandler) UpdateMood(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized", Message: "User not authenticated"})
		return
	}

	moodID := r.PathValue("id")
	var req dto.UpdateMoodRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{Error: "invalid_request", Message: "Invalid request body"})
		return
	}

	domainMood, err := h.repo.GetByID(r.Context(), moodID)
	if err != nil {
		respondJSON(w, http.StatusNotFound, dto.ErrorResponse{Error: "not_found", Message: "Mood not found"})
		return
	}
	if domainMood.UserID != userID {
		respondJSON(w, http.StatusForbidden, dto.ErrorResponse{Error: "forbidden", Message: "You don't have permission to update this mood"})
		return
	}

	if err := domainMood.Update(mood.MoodLevel(req.Level), req.Note); err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{Error: "validation_error", Message: err.Error()})
		return
	}

	if err := h.repo.Update(r.Context(), domainMood); err != nil {
		h.logger.Error("Failed to update mood", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "update_failed", Message: "Failed to update mood"})
		return
	}

	respondJSON(w, http.StatusOK, dto.MoodResponse{
		UserID: domainMood.UserID,
		ID:     domainMood.ID, Level: int(domainMood.Level), Note: domainMood.Note,
		MoodDate: domainMood.MoodDate, CreatedAt: domainMood.CreatedAt, UpdatedAt: domainMood.UpdatedAt,
	})
}

func (h *MoodHandler) DeleteMood(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized", Message: "User not authenticated"})
		return
	}

	moodID := r.PathValue("id")
	domainMood, err := h.repo.GetByID(r.Context(), moodID)
	if err != nil {
		respondJSON(w, http.StatusNotFound, dto.ErrorResponse{Error: "not_found", Message: "Mood not found"})
		return
	}
	if domainMood.UserID != userID {
		respondJSON(w, http.StatusForbidden, dto.ErrorResponse{Error: "forbidden", Message: "You don't have permission to delete this mood"})
		return
	}

	if err := h.repo.Delete(r.Context(), moodID); err != nil {
		h.logger.Error("Failed to delete mood", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "deletion_failed", Message: "Failed to delete mood"})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
