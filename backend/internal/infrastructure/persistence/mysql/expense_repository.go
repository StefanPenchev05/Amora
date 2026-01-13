package mysql

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/StefanPenchev05/Amora/backend/internal/domain/expense"
	"github.com/StefanPenchev05/Amora/backend/internal/infrastructure/persistence/mysql/models"
)

type ExpenseRepository struct {
	db *gorm.DB
}

func NewExpenseRepository(db *gorm.DB) *ExpenseRepository {
	return &ExpenseRepository{db: db}
}

func (r *ExpenseRepository) Create(ctx context.Context, domainExpense *expense.Expense) error {
	domainExpense.ID = uuid.New().String()
	
	model := &models.Expense{
		ID:          domainExpense.ID,
		UserID:      domainExpense.UserID,
		Amount:      domainExpense.Amount,
		Description: domainExpense.Description,
		Category:    string(domainExpense.Category),
		PaidBy:      string(domainExpense.PaidBy),
		IsSettled:   domainExpense.IsSettled,
		ExpenseDate: domainExpense.ExpenseDate,
		CreatedAt:   domainExpense.CreatedAt,
		UpdatedAt:   domainExpense.UpdatedAt,
	}
	
	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return fmt.Errorf("failed to create expense: %w", err)
	}
	
	return nil
}

func (r *ExpenseRepository) GetByID(ctx context.Context, id string) (*expense.Expense, error) {
	var model models.Expense
	
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("expense not found")
		}
		return nil, fmt.Errorf("failed to get expense: %w", err)
	}
	
	return r.modelToDomain(&model), nil
}

func (r *ExpenseRepository) GetByUserID(ctx context.Context, userID string) ([]*expense.Expense, error) {
	var models []models.Expense
	
	if err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("expense_date DESC").
		Find(&models).Error; err != nil {
		return nil, fmt.Errorf("failed to get expenses: %w", err)
	}
	
	expenses := make([]*expense.Expense, len(models))
	for i, m := range models {
		expenses[i] = r.modelToDomain(&m)
	}
	
	return expenses, nil
}

func (r *ExpenseRepository) GetByUserIDAndDateRange(ctx context.Context, userID string, startDate, endDate time.Time) ([]*expense.Expense, error) {
	var models []models.Expense
	
	if err := r.db.WithContext(ctx).
		Where("user_id = ? AND expense_date >= ? AND expense_date <= ?", userID, startDate, endDate).
		Order("expense_date DESC").
		Find(&models).Error; err != nil {
		return nil, fmt.Errorf("failed to get expenses: %w", err)
	}
	
	expenses := make([]*expense.Expense, len(models))
	for i, m := range models {
		expenses[i] = r.modelToDomain(&m)
	}
	
	return expenses, nil
}

func (r *ExpenseRepository) Update(ctx context.Context, domainExpense *expense.Expense) error {
	model := &models.Expense{
		ID:          domainExpense.ID,
		UserID:      domainExpense.UserID,
		Amount:      domainExpense.Amount,
		Description: domainExpense.Description,
		Category:    string(domainExpense.Category),
		PaidBy:      string(domainExpense.PaidBy),
		IsSettled:   domainExpense.IsSettled,
		ExpenseDate: domainExpense.ExpenseDate,
		UpdatedAt:   domainExpense.UpdatedAt,
	}
	
	if err := r.db.WithContext(ctx).Save(model).Error; err != nil {
		return fmt.Errorf("failed to update expense: %w", err)
	}
	
	return nil
}

func (r *ExpenseRepository) Delete(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).Delete(&models.Expense{}, "id = ?", id)
	
	if result.Error != nil {
		return fmt.Errorf("failed to delete expense: %w", result.Error)
	}
	
	if result.RowsAffected == 0 {
		return fmt.Errorf("expense not found")
	}
	
	return nil
}

func (r *ExpenseRepository) modelToDomain(model *models.Expense) *expense.Expense {
	return &expense.Expense{
		ID:          model.ID,
		UserID:      model.UserID,
		Amount:      model.Amount,
		Description: model.Description,
		Category:    expense.ExpenseCategory(model.Category),
		PaidBy:      expense.PaidBy(model.PaidBy),
		IsSettled:   model.IsSettled,
		ExpenseDate: model.ExpenseDate,
		CreatedAt:   model.CreatedAt,
		UpdatedAt:   model.UpdatedAt,
	}
}
