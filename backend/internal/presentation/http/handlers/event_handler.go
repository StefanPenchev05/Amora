package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"time"

	"github.com/StefanPenchev05/Amora/backend/internal/domain/event"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql"
	"github.com/StefanPenchev05/Amora/backend/internal/presentation/http/dto"
	"gorm.io/gorm"
)

type EventHandler struct {
	repo   event.Repository
	logger *slog.Logger
}

func NewEventHandler(db *gorm.DB, logger *slog.Logger) *EventHandler {
	return &EventHandler{
		repo:   mysql.NewEventRepository(db),
		logger: logger,
	}
}

// CreateEvent creates a new event
// POST /api/events
func (h *EventHandler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "unauthorized",
			Message: "User not authenticated",
		})
		return
	}
	
	var req dto.CreateEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}
	
	domainEvent, err := event.NewEvent(userID, req.Title, req.Description, event.EventCategory(req.Category), req.EventDate)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}
	
	if err := h.repo.Create(r.Context(), domainEvent); err != nil {
		h.logger.Error("Failed to create event", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "creation_failed",
			Message: "Failed to create event",
		})
		return
	}
	
	respondJSON(w, http.StatusCreated, dto.EventResponse{
		ID:          domainEvent.ID,
		Title:       domainEvent.Title,
		Description: domainEvent.Description,
		Category:    string(domainEvent.Category),
		EventDate:   domainEvent.EventDate,
		CreatedAt:   domainEvent.CreatedAt,
		UpdatedAt:   domainEvent.UpdatedAt,
	})
}

// GetEvents retrieves all events for the user
// GET /api/events
func (h *EventHandler) GetEvents(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "unauthorized",
			Message: "User not authenticated",
		})
		return
	}
	
	// Check for date range query params
	startDateStr := r.URL.Query().Get("start_date")
	endDateStr := r.URL.Query().Get("end_date")
	
	var events []*event.Event
	var err error
	
	if startDateStr != "" && endDateStr != "" {
		startDate, _ := time.Parse("2006-01-02", startDateStr)
		endDate, _ := time.Parse("2006-01-02", endDateStr)
		events, err = h.repo.GetByUserIDAndDateRange(r.Context(), userID, startDate, endDate)
	} else {
		events, err = h.repo.GetByUserID(r.Context(), userID)
	}
	
	if err != nil {
		h.logger.Error("Failed to get events", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "fetch_failed",
			Message: "Failed to fetch events",
		})
		return
	}
	
	responses := make([]dto.EventResponse, len(events))
	for i, e := range events {
		responses[i] = dto.EventResponse{
			ID:          e.ID,
			Title:       e.Title,
			Description: e.Description,
			Category:    string(e.Category),
			EventDate:   e.EventDate,
			CreatedAt:   e.CreatedAt,
			UpdatedAt:   e.UpdatedAt,
		}
	}
	
	respondJSON(w, http.StatusOK, responses)
}

// UpdateEvent updates an existing event
// PUT /api/events/{id}
func (h *EventHandler) UpdateEvent(w http.ResponseWriter, r *http.Request) {
	eventID := r.PathValue("id")
	
	var req dto.UpdateEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}
	
	domainEvent, err := h.repo.GetByID(r.Context(), eventID)
	if err != nil {
		respondJSON(w, http.StatusNotFound, dto.ErrorResponse{
			Error:   "not_found",
			Message: "Event not found",
		})
		return
	}
	
	if err := domainEvent.Update(req.Title, req.Description, event.EventCategory(req.Category), req.EventDate); err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}
	
	if err := h.repo.Update(r.Context(), domainEvent); err != nil {
		h.logger.Error("Failed to update event", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "update_failed",
			Message: "Failed to update event",
		})
		return
	}
	
	respondJSON(w, http.StatusOK, dto.EventResponse{
		ID:          domainEvent.ID,
		Title:       domainEvent.Title,
		Description: domainEvent.Description,
		Category:    string(domainEvent.Category),
		EventDate:   domainEvent.EventDate,
		CreatedAt:   domainEvent.CreatedAt,
		UpdatedAt:   domainEvent.UpdatedAt,
	})
}

// DeleteEvent deletes an event
// DELETE /api/events/{id}
func (h *EventHandler) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	eventID := r.PathValue("id")
	
	if err := h.repo.Delete(r.Context(), eventID); err != nil {
		h.logger.Error("Failed to delete event", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "deletion_failed",
			Message: "Failed to delete event",
		})
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}
