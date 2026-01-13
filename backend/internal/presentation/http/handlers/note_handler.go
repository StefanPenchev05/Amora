package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"sort"

	"github.com/StefanPenchev05/Amora/backend/internal/domain/note"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql/models"
	"github.com/StefanPenchev05/Amora/backend/internal/presentation/http/dto"
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

type NoteHandler struct {
	db     *gorm.DB
	repo   note.Repository
	logger *slog.Logger
}

func NewNoteHandler(db *gorm.DB, logger *slog.Logger) *NoteHandler {
	return &NoteHandler{
		db:     db,
		repo:   mysql.NewNoteRepository(db),
		logger: logger,
	}
}

func (h *NoteHandler) sharedUserIDs(userID string) []string {
	var profile models.Profile
	if err := h.db.First(&profile, "user_id = ?", userID).Error; err != nil {
		return []string{userID}
	}
	if profile.RelationshipID == nil || *profile.RelationshipID == "" {
		return []string{userID}
	}

	var rel models.Relationship
	if err := h.db.First(&rel, "id = ?", *profile.RelationshipID).Error; err != nil {
		return []string{userID}
	}
	if rel.Status != models.RelationshipActive || rel.UserBID == nil || *rel.UserBID == "" {
		return []string{userID}
	}
	if rel.UserAID != userID && *rel.UserBID != userID {
		return []string{userID}
	}
	if rel.UserAID == *rel.UserBID {
		return []string{rel.UserAID}
	}
	return []string{rel.UserAID, *rel.UserBID}
}

// CreateNote creates a new note
// POST /api/notes
func (h *NoteHandler) CreateNote(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	var req dto.CreateNoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	domainNote, err := note.NewNote(userID, req.Title, req.Content, note.NoteColor(req.Color))
	if err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	if err := h.repo.Create(r.Context(), domainNote); err != nil {
		h.logger.Error("Failed to create note", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "creation_failed",
			Message: "Failed to create note",
		})
		return
	}

	respondJSON(w, http.StatusCreated, dto.NoteResponse{
		ID:        domainNote.ID,
		Title:     domainNote.Title,
		Content:   domainNote.Content,
		Color:     string(domainNote.Color),
		IsPinned:  domainNote.IsPinned,
		CreatedAt: domainNote.CreatedAt,
		UpdatedAt: domainNote.UpdatedAt,
	})
}

// GetNotes retrieves all notes for the user
// GET /api/notes
func (h *NoteHandler) GetNotes(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	userIDs := h.sharedUserIDs(userID)
	var notes []*note.Note
	for _, uid := range userIDs {
		items, err := h.repo.GetByUserID(r.Context(), uid)
		if err != nil {
			h.logger.Error("Failed to get notes", "error", err)
			respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{
				Error:   "retrieval_failed",
				Message: "Failed to get notes",
			})
			return
		}
		notes = append(notes, items...)
	}

	sort.Slice(notes, func(i, j int) bool {
		if notes[i].IsPinned != notes[j].IsPinned {
			return notes[i].IsPinned
		}
		return notes[i].UpdatedAt.After(notes[j].UpdatedAt)
	})

	response := make([]dto.NoteResponse, len(notes))
	for i, n := range notes {
		response[i] = dto.NoteResponse{
			ID:        n.ID,
			Title:     n.Title,
			Content:   n.Content,
			Color:     string(n.Color),
			IsPinned:  n.IsPinned,
			CreatedAt: n.CreatedAt,
			UpdatedAt: n.UpdatedAt,
		}
	}

	respondJSON(w, http.StatusOK, response)
}

// UpdateNote updates an existing note
// PUT /api/notes/{id}
func (h *NoteHandler) UpdateNote(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	noteID := chi.URLParam(r, "id")

	existingNote, err := h.repo.GetByID(r.Context(), noteID)
	if err != nil {
		respondJSON(w, http.StatusNotFound, dto.ErrorResponse{
			Error:   "not_found",
			Message: "Note not found",
		})
		return
	}

	if existingNote.UserID != userID {
		respondJSON(w, http.StatusForbidden, dto.ErrorResponse{
			Error:   "forbidden",
			Message: "You don't have permission to update this note",
		})
		return
	}

	var req dto.UpdateNoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	if err := existingNote.Update(req.Title, req.Content, note.NoteColor(req.Color)); err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	if err := h.repo.Update(r.Context(), existingNote); err != nil {
		h.logger.Error("Failed to update note", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "update_failed",
			Message: "Failed to update note",
		})
		return
	}

	respondJSON(w, http.StatusOK, dto.NoteResponse{
		ID:        existingNote.ID,
		Title:     existingNote.Title,
		Content:   existingNote.Content,
		Color:     string(existingNote.Color),
		IsPinned:  existingNote.IsPinned,
		CreatedAt: existingNote.CreatedAt,
		UpdatedAt: existingNote.UpdatedAt,
	})
}

// TogglePin toggles the pin status of a note
// POST /api/notes/{id}/toggle-pin
func (h *NoteHandler) TogglePin(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	noteID := chi.URLParam(r, "id")

	existingNote, err := h.repo.GetByID(r.Context(), noteID)
	if err != nil {
		respondJSON(w, http.StatusNotFound, dto.ErrorResponse{
			Error:   "not_found",
			Message: "Note not found",
		})
		return
	}

	if existingNote.UserID != userID {
		respondJSON(w, http.StatusForbidden, dto.ErrorResponse{
			Error:   "forbidden",
			Message: "You don't have permission to update this note",
		})
		return
	}

	existingNote.TogglePin()

	if err := h.repo.Update(r.Context(), existingNote); err != nil {
		h.logger.Error("Failed to toggle pin", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "update_failed",
			Message: "Failed to toggle pin",
		})
		return
	}

	respondJSON(w, http.StatusOK, dto.NoteResponse{
		ID:        existingNote.ID,
		Title:     existingNote.Title,
		Content:   existingNote.Content,
		Color:     string(existingNote.Color),
		IsPinned:  existingNote.IsPinned,
		CreatedAt: existingNote.CreatedAt,
		UpdatedAt: existingNote.UpdatedAt,
	})
}

// DeleteNote deletes a note
// DELETE /api/notes/{id}
func (h *NoteHandler) DeleteNote(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	noteID := chi.URLParam(r, "id")

	existingNote, err := h.repo.GetByID(r.Context(), noteID)
	if err != nil {
		respondJSON(w, http.StatusNotFound, dto.ErrorResponse{
			Error:   "not_found",
			Message: "Note not found",
		})
		return
	}

	if existingNote.UserID != userID {
		respondJSON(w, http.StatusForbidden, dto.ErrorResponse{
			Error:   "forbidden",
			Message: "You don't have permission to delete this note",
		})
		return
	}

	if err := h.repo.Delete(r.Context(), noteID); err != nil {
		h.logger.Error("Failed to delete note", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "deletion_failed",
			Message: "Failed to delete note",
		})
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
