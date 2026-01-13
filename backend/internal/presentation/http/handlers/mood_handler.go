package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"time"

	"github.com/StefanPenchev05/Amora/backend/internal/domain/mood"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql"
	"github.com/StefanPenchev05/Amora/backend/internal/presentation/http/dto"
	"gorm.io/gorm"
)

type MoodHandler struct {
	repo   mood.Repository
	logger *slog.Logger
}

func NewMoodHandler(db *gorm.DB, logger *slog.Logger) *MoodHandler {
	return &MoodHandler{
		repo:   mysql.NewMoodRepository(db),
		logger: logger,
	}
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
		ID: domainMood.ID, Level: int(domainMood.Level), Note: domainMood.Note,
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
	
	var moods []*mood.Mood
	var err error
	
	if startDateStr != "" && endDateStr != "" {
		startDate, _ := time.Parse("2006-01-02", startDateStr)
		endDate, _ := time.Parse("2006-01-02", endDateStr)
		moods, err = h.repo.GetByUserIDAndDateRange(r.Context(), userID, startDate, endDate)
	} else {
		moods, err = h.repo.GetByUserID(r.Context(), userID)
	}
	
	if err != nil {
		h.logger.Error("Failed to get moods", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "fetch_failed", Message: "Failed to fetch moods"})
		return
	}
	
	responses := make([]dto.MoodResponse, len(moods))
	for i, m := range moods {
		responses[i] = dto.MoodResponse{
			ID: m.ID, Level: int(m.Level), Note: m.Note, MoodDate: m.MoodDate, CreatedAt: m.CreatedAt, UpdatedAt: m.UpdatedAt,
		}
	}
	
	respondJSON(w, http.StatusOK, responses)
}

func (h *MoodHandler) UpdateMood(w http.ResponseWriter, r *http.Request) {
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
		ID: domainMood.ID, Level: int(domainMood.Level), Note: domainMood.Note,
		MoodDate: domainMood.MoodDate, CreatedAt: domainMood.CreatedAt, UpdatedAt: domainMood.UpdatedAt,
	})
}

func (h *MoodHandler) DeleteMood(w http.ResponseWriter, r *http.Request) {
	moodID := r.PathValue("id")
	if err := h.repo.Delete(r.Context(), moodID); err != nil {
		h.logger.Error("Failed to delete mood", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "deletion_failed", Message: "Failed to delete mood"})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
