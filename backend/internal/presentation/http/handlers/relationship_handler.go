package handlers

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"log/slog"
	"math/big"
	"net/http"
	"strings"
	"time"
	"unicode"

	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql/models"
	"github.com/StefanPenchev05/Amora/backend/internal/presentation/http/dto"
	"gorm.io/gorm"
)

type RelationshipHandler struct {
	db     *gorm.DB
	logger *slog.Logger
}

const (
	msgUserNotAuthenticated = "User not authenticated"
	msgFailedLoadProfile    = "Failed to load profile"
	msgFetchFailed          = "fetch_failed"
	msgFailedCreateInvite   = "Failed to create invite"
	msgFailedAcceptInvite   = "Failed to accept invite"
	msgFailedRegenerate     = "Failed to regenerate invite"
	queryUserID             = "user_id = ?"
	queryID                 = "id = ?"
	queryInviteCode         = "invite_code = ?"
)

func NewRelationshipHandler(db *gorm.DB, logger *slog.Logger) *RelationshipHandler {
	return &RelationshipHandler{db: db, logger: logger}
}

type RelationshipStatusResponse struct {
	RelationshipID *string `json:"relationship_id,omitempty"`
	Status         string  `json:"status"`
	InviteCode     *string `json:"invite_code,omitempty"`
	ConnectedSince *string `json:"connected_since,omitempty"`
	DaysConnected  *int    `json:"days_connected,omitempty"`
	Stats          *struct {
		MoodsTotal           int     `json:"moods_total"`
		MoodsLast7Days       int     `json:"moods_last_7_days"`
		EventsTotal          int     `json:"events_total"`
		EventsUpcoming       int     `json:"events_upcoming"`
		EventsNext7Days      int     `json:"events_next_7_days"`
		NotesTotal           int     `json:"notes_total"`
		MemoriesTotal        int     `json:"memories_total"`
		ExpensesTotal        float64 `json:"expenses_total"`
		ExpensesUnsettled    float64 `json:"expenses_unsettled"`
		ExpensesUnsettledCnt int     `json:"expenses_unsettled_count"`
	} `json:"stats,omitempty"`
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

func normalizeInviteCode(input string) string {
	// Accept pasted codes with spaces/dashes/etc.
	// We only keep A-Z and 0-9 and uppercase everything.
	input = strings.TrimSpace(input)
	if input == "" {
		return ""
	}
	var b strings.Builder
	b.Grow(len(input))
	for _, r := range input {
		if r == '-' || unicode.IsSpace(r) {
			continue
		}
		if r >= 'a' && r <= 'z' {
			r = r - ('a' - 'A')
		}
		if (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
		}
	}
	return b.String()
}

func (h *RelationshipHandler) userIDFromContext(r *http.Request) (string, bool) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		return "", false
	}
	return userID, true
}

func (h *RelationshipHandler) loadProfile(userID string) (*models.Profile, error) {
	var profile models.Profile
	if err := h.db.First(&profile, queryUserID, userID).Error; err != nil {
		return nil, err
	}
	return &profile, nil
}

func (h *RelationshipHandler) loadRelationshipByID(relID string) (*models.Relationship, error) {
	var rel models.Relationship
	if err := h.db.First(&rel, queryID, relID).Error; err != nil {
		return nil, err
	}
	return &rel, nil
}

func (h *RelationshipHandler) loadRelationshipByInviteCode(code string) (*models.Relationship, error) {
	var rel models.Relationship
	if err := h.db.First(&rel, queryInviteCode, code).Error; err != nil {
		return nil, err
	}
	return &rel, nil
}

func (h *RelationshipHandler) parseAcceptInviteCode(r *http.Request) (string, *dto.ErrorResponse, int) {
	var req AcceptInviteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return "", &dto.ErrorResponse{Error: "invalid_request", Message: "Invalid request body"}, http.StatusBadRequest
	}
	code := normalizeInviteCode(req.Code)
	if code == "" {
		return "", &dto.ErrorResponse{Error: "validation_error", Message: "Invite code is required"}, http.StatusBadRequest
	}
	if len(code) != 8 {
		return "", &dto.ErrorResponse{Error: "validation_error", Message: "Invite code must be 8 characters"}, http.StatusBadRequest
	}
	return code, nil, http.StatusOK
}

func (h *RelationshipHandler) acceptInviteTransaction(rel *models.Relationship, userID string) error {
	return h.db.Transaction(func(tx *gorm.DB) error {
		rel.UserBID = &userID
		rel.Status = models.RelationshipActive
		if err := tx.Save(rel).Error; err != nil {
			return err
		}
		if err := tx.Model(&models.Profile{}).Where(queryUserID, rel.UserAID).Update("relationship_id", rel.ID).Error; err != nil {
			return err
		}
		if err := tx.Model(&models.Profile{}).Where(queryUserID, userID).Update("relationship_id", rel.ID).Error; err != nil {
			return err
		}
		return nil
	})
}

func (h *RelationshipHandler) partnerInfo(rel *models.Relationship, userID string) *struct {
	UserID   string `json:"user_id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	FullName string `json:"full_name"`
} {
	partnerID := ""
	if rel.UserAID == userID && rel.UserBID != nil {
		partnerID = *rel.UserBID
	} else if rel.UserBID != nil && *rel.UserBID == userID {
		partnerID = rel.UserAID
	}
	if partnerID == "" {
		return nil
	}

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
	if err != nil || row.ID == "" {
		return nil
	}

	return &struct {
		UserID   string `json:"user_id"`
		Email    string `json:"email"`
		Username string `json:"username"`
		FullName string `json:"full_name"`
	}{UserID: row.ID, Email: row.Email, Username: row.Username, FullName: row.FullName}
}

func (h *RelationshipHandler) relationshipUserIDs(rel *models.Relationship) []string {
	ids := []string{rel.UserAID}
	if rel.UserBID != nil && *rel.UserBID != "" {
		ids = append(ids, *rel.UserBID)
	}
	return ids
}

func (h *RelationshipHandler) relationshipStats(userIDs []string) (*struct {
	MoodsTotal           int     `json:"moods_total"`
	MoodsLast7Days       int     `json:"moods_last_7_days"`
	EventsTotal          int     `json:"events_total"`
	EventsUpcoming       int     `json:"events_upcoming"`
	EventsNext7Days      int     `json:"events_next_7_days"`
	NotesTotal           int     `json:"notes_total"`
	MemoriesTotal        int     `json:"memories_total"`
	ExpensesTotal        float64 `json:"expenses_total"`
	ExpensesUnsettled    float64 `json:"expenses_unsettled"`
	ExpensesUnsettledCnt int     `json:"expenses_unsettled_count"`
}, error) {
	if len(userIDs) == 0 {
		return nil, nil
	}

	now := time.Now().UTC()
	weekAgo := now.AddDate(0, 0, -7)
	weekAhead := now.AddDate(0, 0, 7)

	var moodsTotal int64
	if err := h.db.Model(&models.Mood{}).Where("user_id IN ?", userIDs).Count(&moodsTotal).Error; err != nil {
		return nil, err
	}
	var moodsLast7 int64
	if err := h.db.Model(&models.Mood{}).Where("user_id IN ? AND mood_date >= ?", userIDs, weekAgo).Count(&moodsLast7).Error; err != nil {
		return nil, err
	}

	var eventsTotal int64
	if err := h.db.Model(&models.Event{}).Where("user_id IN ?", userIDs).Count(&eventsTotal).Error; err != nil {
		return nil, err
	}
	var eventsUpcoming int64
	if err := h.db.Model(&models.Event{}).Where("user_id IN ? AND event_date >= ?", userIDs, now).Count(&eventsUpcoming).Error; err != nil {
		return nil, err
	}
	var eventsNext7 int64
	if err := h.db.Model(&models.Event{}).
		Where("user_id IN ? AND event_date >= ? AND event_date < ?", userIDs, now, weekAhead).
		Count(&eventsNext7).Error; err != nil {
		return nil, err
	}

	var notesTotal int64
	if err := h.db.Model(&models.Note{}).Where("user_id IN ?", userIDs).Count(&notesTotal).Error; err != nil {
		return nil, err
	}
	var memoriesTotal int64
	if err := h.db.Model(&models.Memory{}).Where("user_id IN ?", userIDs).Count(&memoriesTotal).Error; err != nil {
		return nil, err
	}

	type sumRow struct {
		Total float64 `gorm:"column:total"`
	}
	var totalExpenses sumRow
	if err := h.db.Model(&models.Expense{}).
		Select("COALESCE(SUM(amount),0) as total").
		Where("user_id IN ?", userIDs).
		Scan(&totalExpenses).Error; err != nil {
		return nil, err
	}
	var unsettledExpenses sumRow
	if err := h.db.Model(&models.Expense{}).
		Select("COALESCE(SUM(amount),0) as total").
		Where("user_id IN ? AND is_settled = ?", userIDs, false).
		Scan(&unsettledExpenses).Error; err != nil {
		return nil, err
	}
	var unsettledCount int64
	if err := h.db.Model(&models.Expense{}).Where("user_id IN ? AND is_settled = ?", userIDs, false).Count(&unsettledCount).Error; err != nil {
		return nil, err
	}

	return &struct {
		MoodsTotal           int     `json:"moods_total"`
		MoodsLast7Days       int     `json:"moods_last_7_days"`
		EventsTotal          int     `json:"events_total"`
		EventsUpcoming       int     `json:"events_upcoming"`
		EventsNext7Days      int     `json:"events_next_7_days"`
		NotesTotal           int     `json:"notes_total"`
		MemoriesTotal        int     `json:"memories_total"`
		ExpensesTotal        float64 `json:"expenses_total"`
		ExpensesUnsettled    float64 `json:"expenses_unsettled"`
		ExpensesUnsettledCnt int     `json:"expenses_unsettled_count"`
	}{
		MoodsTotal:           int(moodsTotal),
		MoodsLast7Days:       int(moodsLast7),
		EventsTotal:          int(eventsTotal),
		EventsUpcoming:       int(eventsUpcoming),
		EventsNext7Days:      int(eventsNext7),
		NotesTotal:           int(notesTotal),
		MemoriesTotal:        int(memoriesTotal),
		ExpensesTotal:        totalExpenses.Total,
		ExpensesUnsettled:    unsettledExpenses.Total,
		ExpensesUnsettledCnt: int(unsettledCount),
	}, nil
}

func (h *RelationshipHandler) clearRelationshipTransaction(rel *models.Relationship) error {
	return h.db.Transaction(func(tx *gorm.DB) error {
		// Clear profiles first.
		if err := tx.Model(&models.Profile{}).Where(queryUserID, rel.UserAID).Update("relationship_id", nil).Error; err != nil {
			return err
		}
		if rel.UserBID != nil && *rel.UserBID != "" {
			if err := tx.Model(&models.Profile{}).Where(queryUserID, *rel.UserBID).Update("relationship_id", nil).Error; err != nil {
				return err
			}
		}
		// Delete the relationship.
		if err := tx.Delete(&models.Relationship{}, queryID, rel.ID).Error; err != nil {
			return err
		}
		return nil
	})
}

// GET /api/relationship
func (h *RelationshipHandler) GetStatus(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.userIDFromContext(r)
	if !ok {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized", Message: msgUserNotAuthenticated})
		return
	}

	profile, err := h.loadProfile(userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			respondJSON(w, http.StatusOK, RelationshipStatusResponse{Status: "none"})
			return
		}
		h.logger.Error(msgFailedLoadProfile, "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: msgFetchFailed, Message: "Failed to fetch relationship"})
		return
	}

	if profile.RelationshipID == nil || *profile.RelationshipID == "" {
		respondJSON(w, http.StatusOK, RelationshipStatusResponse{Status: "none"})
		return
	}

	relID := *profile.RelationshipID
	rel, err := h.loadRelationshipByID(relID)
	if err != nil {
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
		resp.Partner = h.partnerInfo(rel, userID)
		since := rel.CreatedAt.UTC().Format("2006-01-02T15:04:05Z")
		resp.ConnectedSince = &since
		days := int((time.Since(rel.CreatedAt).Hours()) / 24)
		if days < 0 {
			days = 0
		}
		resp.DaysConnected = &days

		stats, statsErr := h.relationshipStats(h.relationshipUserIDs(rel))
		if statsErr != nil {
			h.logger.Error("Failed to compute relationship stats", "error", statsErr)
		} else {
			resp.Stats = stats
		}
	}

	respondJSON(w, http.StatusOK, resp)
}

// POST /api/relationship/breakup
func (h *RelationshipHandler) BreakUp(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.userIDFromContext(r)
	if !ok {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized", Message: msgUserNotAuthenticated})
		return
	}

	profile, err := h.loadProfile(userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			respondJSON(w, http.StatusOK, RelationshipStatusResponse{Status: "none"})
			return
		}
		h.logger.Error(msgFailedLoadProfile, "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: msgFetchFailed, Message: "Failed to break up"})
		return
	}

	if profile.RelationshipID == nil || *profile.RelationshipID == "" {
		respondJSON(w, http.StatusOK, RelationshipStatusResponse{Status: "none"})
		return
	}

	rel, err := h.loadRelationshipByID(*profile.RelationshipID)
	if err != nil {
		// Clean up dangling profile reference.
		_ = h.db.Model(&models.Profile{}).Where(queryUserID, userID).Update("relationship_id", nil).Error
		respondJSON(w, http.StatusOK, RelationshipStatusResponse{Status: "none"})
		return
	}

	// Only participants can break up.
	isParticipant := rel.UserAID == userID || (rel.UserBID != nil && *rel.UserBID == userID)
	if !isParticipant {
		respondJSON(w, http.StatusForbidden, dto.ErrorResponse{Error: "forbidden", Message: "Not allowed"})
		return
	}
	if rel.Status != models.RelationshipActive {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{Error: "invalid_state", Message: "Relationship is not active"})
		return
	}

	if err := h.clearRelationshipTransaction(rel); err != nil {
		h.logger.Error("Failed to break up", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "breakup_failed", Message: "Failed to break up"})
		return
	}

	respondJSON(w, http.StatusOK, RelationshipStatusResponse{Status: "none"})
}

// POST /api/relationship/invite
func (h *RelationshipHandler) CreateInvite(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.userIDFromContext(r)
	if !ok {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized", Message: msgUserNotAuthenticated})
		return
	}

	profile, err := h.loadProfile(userID)
	if err != nil {
		h.logger.Error(msgFailedLoadProfile, "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: msgFetchFailed, Message: msgFailedCreateInvite})
		return
	}

	// If user already has a relationship, return it.
	if profile.RelationshipID != nil && *profile.RelationshipID != "" {
		rel, err := h.loadRelationshipByID(*profile.RelationshipID)
		if err == nil {
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
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "invite_failed", Message: msgFailedCreateInvite})
		return
	}

	rel := models.Relationship{Status: models.RelationshipPending, InviteCode: code, UserAID: userID}
	if err := h.db.Create(&rel).Error; err != nil {
		h.logger.Error("Failed to create relationship", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "invite_failed", Message: msgFailedCreateInvite})
		return
	}

	if err := h.db.Model(&models.Profile{}).Where(queryUserID, userID).Update("relationship_id", rel.ID).Error; err != nil {
		h.logger.Error("Failed to update profile relationship_id", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "invite_failed", Message: msgFailedCreateInvite})
		return
	}

	resp := RelationshipStatusResponse{RelationshipID: &rel.ID, Status: string(rel.Status)}
	resp.InviteCode = &rel.InviteCode
	respondJSON(w, http.StatusOK, resp)
}

// POST /api/relationship/accept
func (h *RelationshipHandler) AcceptInvite(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.userIDFromContext(r)
	if !ok {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized", Message: msgUserNotAuthenticated})
		return
	}

	code, parseErr, parseStatus := h.parseAcceptInviteCode(r)
	if parseErr != nil {
		respondJSON(w, parseStatus, *parseErr)
		return
	}

	myProfile, err := h.loadProfile(userID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: msgFetchFailed, Message: msgFailedAcceptInvite})
		return
	}
	if myProfile.RelationshipID != nil && *myProfile.RelationshipID != "" {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{Error: "already_connected", Message: "You are already connected"})
		return
	}

	rel, err := h.loadRelationshipByInviteCode(code)
	if err != nil {
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

	if err := h.acceptInviteTransaction(rel, userID); err != nil {
		h.logger.Error(msgFailedAcceptInvite, "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "accept_failed", Message: msgFailedAcceptInvite})
		return
	}

	relID := rel.ID
	respondJSON(w, http.StatusOK, RelationshipStatusResponse{RelationshipID: &relID, Status: string(rel.Status)})
}

// POST /api/relationship/invite/regenerate
// Rotates the invite code for an existing pending relationship created by the current user.
func (h *RelationshipHandler) RegenerateInvite(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.userIDFromContext(r)
	if !ok {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized", Message: msgUserNotAuthenticated})
		return
	}

	profile, err := h.loadProfile(userID)
	if err != nil {
		h.logger.Error(msgFailedLoadProfile, "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: msgFetchFailed, Message: msgFailedRegenerate})
		return
	}

	if profile.RelationshipID == nil || *profile.RelationshipID == "" {
		// No relationship yet — create a fresh invite.
		h.CreateInvite(w, r)
		return
	}

	rel, err := h.loadRelationshipByID(*profile.RelationshipID)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{Error: "not_found", Message: "Relationship not found"})
		return
	}

	// Only the inviter can rotate a pending invite.
	if rel.Status != models.RelationshipPending {
		relID := rel.ID
		respondJSON(w, http.StatusOK, RelationshipStatusResponse{RelationshipID: &relID, Status: string(rel.Status)})
		return
	}
	if rel.UserAID != userID {
		respondJSON(w, http.StatusForbidden, dto.ErrorResponse{Error: "forbidden", Message: "Only the inviter can regenerate the invite"})
		return
	}
	if rel.UserBID != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{Error: "invalid_invite", Message: "Invite is no longer valid"})
		return
	}

	newCode, err := h.generateUniqueInviteCode()
	if err != nil {
		h.logger.Error("Failed to generate invite code", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "invite_failed", Message: msgFailedRegenerate})
		return
	}

	if err := h.db.Model(&models.Relationship{}).Where(queryID, rel.ID).Update("invite_code", newCode).Error; err != nil {
		h.logger.Error("Failed to update invite code", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "invite_failed", Message: msgFailedRegenerate})
		return
	}

	relID := rel.ID
	resp := RelationshipStatusResponse{RelationshipID: &relID, Status: string(models.RelationshipPending)}
	resp.InviteCode = &newCode
	respondJSON(w, http.StatusOK, resp)
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
		if err := h.db.Model(&models.Relationship{}).Where(queryInviteCode, code).Count(&count).Error; err != nil {
			return "", err
		}
		if count == 0 {
			return code, nil
		}
	}
	return "", errors.New("failed to generate unique invite code")
}
