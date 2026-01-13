package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/StefanPenchev05/Amora/backend/internal/domain/memory"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql"
	"github.com/StefanPenchev05/Amora/backend/internal/presentation/http/dto"
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

type MemoryHandler struct {
	repo   memory.Repository
	logger *slog.Logger
}

func NewMemoryHandler(db *gorm.DB, logger *slog.Logger) *MemoryHandler {
	return &MemoryHandler{
		repo:   mysql.NewMemoryRepository(db),
		logger: logger,
	}
}

// CreateMemory creates a new memory
// POST /api/memories
func (h *MemoryHandler) CreateMemory(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	var req dto.CreateMemoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	domainMemory, err := memory.NewMemory(userID, req.Title, req.Description, memory.MemoryCategory(req.Category), req.PhotoURL, req.MemoryDate)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	if err := h.repo.Create(r.Context(), domainMemory); err != nil {
		h.logger.Error("Failed to create memory", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "creation_failed",
			Message: "Failed to create memory",
		})
		return
	}

	respondJSON(w, http.StatusCreated, dto.MemoryResponse{
		ID:          domainMemory.ID,
		Title:       domainMemory.Title,
		Description: domainMemory.Description,
		Category:    string(domainMemory.Category),
		PhotoURL:    domainMemory.PhotoURL,
		MemoryDate:  domainMemory.MemoryDate,
		CreatedAt:   domainMemory.CreatedAt,
		UpdatedAt:   domainMemory.UpdatedAt,
	})
}

// GetMemories retrieves all memories for the user
// GET /api/memories
func (h *MemoryHandler) GetMemories(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	// Check for category filter
	categoryStr := r.URL.Query().Get("category")

	var memories []*memory.Memory
	var err error

	if categoryStr != "" {
		memories, err = h.repo.GetByUserIDAndCategory(r.Context(), userID, memory.MemoryCategory(categoryStr))
	} else {
		memories, err = h.repo.GetByUserID(r.Context(), userID)
	}

	if err != nil {
		h.logger.Error("Failed to get memories", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "retrieval_failed",
			Message: "Failed to get memories",
		})
		return
	}

	response := make([]dto.MemoryResponse, len(memories))
	for i, m := range memories {
		response[i] = dto.MemoryResponse{
			ID:          m.ID,
			Title:       m.Title,
			Description: m.Description,
			Category:    string(m.Category),
			PhotoURL:    m.PhotoURL,
			MemoryDate:  m.MemoryDate,
			CreatedAt:   m.CreatedAt,
			UpdatedAt:   m.UpdatedAt,
		}
	}

	respondJSON(w, http.StatusOK, response)
}

// UpdateMemory updates an existing memory
// PUT /api/memories/{id}
func (h *MemoryHandler) UpdateMemory(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	memoryID := chi.URLParam(r, "id")

	existingMemory, err := h.repo.GetByID(r.Context(), memoryID)
	if err != nil {
		respondJSON(w, http.StatusNotFound, dto.ErrorResponse{
			Error:   "not_found",
			Message: "Memory not found",
		})
		return
	}

	if existingMemory.UserID != userID {
		respondJSON(w, http.StatusForbidden, dto.ErrorResponse{
			Error:   "forbidden",
			Message: "You don't have permission to update this memory",
		})
		return
	}

	var req dto.UpdateMemoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	if err := existingMemory.Update(req.Title, req.Description, memory.MemoryCategory(req.Category), req.PhotoURL, req.MemoryDate); err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	if err := h.repo.Update(r.Context(), existingMemory); err != nil {
		h.logger.Error("Failed to update memory", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "update_failed",
			Message: "Failed to update memory",
		})
		return
	}

	respondJSON(w, http.StatusOK, dto.MemoryResponse{
		ID:          existingMemory.ID,
		Title:       existingMemory.Title,
		Description: existingMemory.Description,
		Category:    string(existingMemory.Category),
		PhotoURL:    existingMemory.PhotoURL,
		MemoryDate:  existingMemory.MemoryDate,
		CreatedAt:   existingMemory.CreatedAt,
		UpdatedAt:   existingMemory.UpdatedAt,
	})
}

// DeleteMemory deletes a memory
// DELETE /api/memories/{id}
func (h *MemoryHandler) DeleteMemory(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	memoryID := chi.URLParam(r, "id")

	existingMemory, err := h.repo.GetByID(r.Context(), memoryID)
	if err != nil {
		respondJSON(w, http.StatusNotFound, dto.ErrorResponse{
			Error:   "not_found",
			Message: "Memory not found",
		})
		return
	}

	if existingMemory.UserID != userID {
		respondJSON(w, http.StatusForbidden, dto.ErrorResponse{
			Error:   "forbidden",
			Message: "You don't have permission to delete this memory",
		})
		return
	}

	if err := h.repo.Delete(r.Context(), memoryID); err != nil {
		h.logger.Error("Failed to delete memory", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "deletion_failed",
			Message: "Failed to delete memory",
		})
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
