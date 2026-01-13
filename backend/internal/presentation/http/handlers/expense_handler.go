package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"time"

	"github.com/StefanPenchev05/Amora/backend/internal/domain/expense"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql"
	"github.com/StefanPenchev05/Amora/backend/internal/presentation/http/dto"
	"gorm.io/gorm"
)

type ExpenseHandler struct {
	repo   expense.Repository
	logger *slog.Logger
}

func NewExpenseHandler(db *gorm.DB, logger *slog.Logger) *ExpenseHandler {
	return &ExpenseHandler{
		repo:   mysql.NewExpenseRepository(db),
		logger: logger,
	}
}

func (h *ExpenseHandler) CreateExpense(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized", Message: "User not authenticated"})
		return
	}
	var req dto.CreateExpenseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{Error: "invalid_request", Message: "Invalid request body"})
		return
	}
	
	domainExpense, err := expense.NewExpense(userID, req.Amount, req.Description, expense.ExpenseCategory(req.Category), expense.PaidBy(req.PaidBy), req.ExpenseDate)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{Error: "validation_error", Message: err.Error()})
		return
	}
	
	if err := h.repo.Create(r.Context(), domainExpense); err != nil {
		h.logger.Error("Failed to create expense", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "creation_failed", Message: "Failed to create expense"})
		return
	}
	
	respondJSON(w, http.StatusCreated, dto.ExpenseResponse{
		ID: domainExpense.ID, Amount: domainExpense.Amount, Description: domainExpense.Description,
		Category: string(domainExpense.Category), PaidBy: string(domainExpense.PaidBy), IsSettled: domainExpense.IsSettled,
		ExpenseDate: domainExpense.ExpenseDate, CreatedAt: domainExpense.CreatedAt, UpdatedAt: domainExpense.UpdatedAt,
	})
}

func (h *ExpenseHandler) GetExpenses(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok || userID == "" {
		respondJSON(w, http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized", Message: "User not authenticated"})
		return
	}
	startDateStr, endDateStr := r.URL.Query().Get("start_date"), r.URL.Query().Get("end_date")
	
	var expenses []*expense.Expense
	var err error
	
	if startDateStr != "" && endDateStr != "" {
		startDate, _ := time.Parse("2006-01-02", startDateStr)
		endDate, _ := time.Parse("2006-01-02", endDateStr)
		expenses, err = h.repo.GetByUserIDAndDateRange(r.Context(), userID, startDate, endDate)
	} else {
		expenses, err = h.repo.GetByUserID(r.Context(), userID)
	}
	
	if err != nil {
		h.logger.Error("Failed to get expenses", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "fetch_failed", Message: "Failed to fetch expenses"})
		return
	}
	
	responses := make([]dto.ExpenseResponse, len(expenses))
	for i, e := range expenses {
		responses[i] = dto.ExpenseResponse{
			ID: e.ID, Amount: e.Amount, Description: e.Description, Category: string(e.Category),
			PaidBy: string(e.PaidBy), IsSettled: e.IsSettled, ExpenseDate: e.ExpenseDate,
			CreatedAt: e.CreatedAt, UpdatedAt: e.UpdatedAt,
		}
	}
	
	respondJSON(w, http.StatusOK, responses)
}

func (h *ExpenseHandler) UpdateExpense(w http.ResponseWriter, r *http.Request) {
	expenseID := r.PathValue("id")
	var req dto.UpdateExpenseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{Error: "invalid_request", Message: "Invalid request body"})
		return
	}
	
	domainExpense, err := h.repo.GetByID(r.Context(), expenseID)
	if err != nil {
		respondJSON(w, http.StatusNotFound, dto.ErrorResponse{Error: "not_found", Message: "Expense not found"})
		return
	}
	
	if err := domainExpense.Update(req.Amount, req.Description, expense.ExpenseCategory(req.Category), expense.PaidBy(req.PaidBy), req.ExpenseDate); err != nil {
		respondJSON(w, http.StatusBadRequest, dto.ErrorResponse{Error: "validation_error", Message: err.Error()})
		return
	}
	
	if err := h.repo.Update(r.Context(), domainExpense); err != nil {
		h.logger.Error("Failed to update expense", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "update_failed", Message: "Failed to update expense"})
		return
	}
	
	respondJSON(w, http.StatusOK, dto.ExpenseResponse{
		ID: domainExpense.ID, Amount: domainExpense.Amount, Description: domainExpense.Description,
		Category: string(domainExpense.Category), PaidBy: string(domainExpense.PaidBy), IsSettled: domainExpense.IsSettled,
		ExpenseDate: domainExpense.ExpenseDate, CreatedAt: domainExpense.CreatedAt, UpdatedAt: domainExpense.UpdatedAt,
	})
}

func (h *ExpenseHandler) SettleExpense(w http.ResponseWriter, r *http.Request) {
	expenseID := r.PathValue("id")
	domainExpense, err := h.repo.GetByID(r.Context(), expenseID)
	if err != nil {
		respondJSON(w, http.StatusNotFound, dto.ErrorResponse{Error: "not_found", Message: "Expense not found"})
		return
	}
	
	domainExpense.Settle()
	if err := h.repo.Update(r.Context(), domainExpense); err != nil {
		h.logger.Error("Failed to settle expense", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "update_failed", Message: "Failed to settle expense"})
		return
	}
	
	respondJSON(w, http.StatusOK, dto.ExpenseResponse{
		ID: domainExpense.ID, Amount: domainExpense.Amount, Description: domainExpense.Description,
		Category: string(domainExpense.Category), PaidBy: string(domainExpense.PaidBy), IsSettled: domainExpense.IsSettled,
		ExpenseDate: domainExpense.ExpenseDate, CreatedAt: domainExpense.CreatedAt, UpdatedAt: domainExpense.UpdatedAt,
	})
}

func (h *ExpenseHandler) DeleteExpense(w http.ResponseWriter, r *http.Request) {
	expenseID := r.PathValue("id")
	if err := h.repo.Delete(r.Context(), expenseID); err != nil {
		h.logger.Error("Failed to delete expense", "error", err)
		respondJSON(w, http.StatusInternalServerError, dto.ErrorResponse{Error: "deletion_failed", Message: "Failed to delete expense"})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
