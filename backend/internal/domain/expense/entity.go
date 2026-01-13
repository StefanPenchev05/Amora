package expense

import (
	"errors"
	"time"
)

// Expense represents a shared expense in the domain
type Expense struct {
	ID          string
	UserID      string
	Amount      float64
	Description string
	Category    ExpenseCategory
	PaidBy      PaidBy
	IsSettled   bool
	ExpenseDate time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type ExpenseCategory string

const (
	CategoryGroceries     ExpenseCategory = "groceries"
	CategoryDates         ExpenseCategory = "dates"
	CategoryBills         ExpenseCategory = "bills"
	CategoryEntertainment ExpenseCategory = "entertainment"
	CategoryTravel        ExpenseCategory = "travel"
	CategoryOther         ExpenseCategory = "other"
)

type PaidBy string

const (
	PaidByMe      PaidBy = "me"
	PaidByPartner PaidBy = "partner"
	PaidBySplit   PaidBy = "split"
)

// NewExpense creates a new expense with validation
func NewExpense(userID string, amount float64, description string, category ExpenseCategory, paidBy PaidBy, expenseDate time.Time) (*Expense, error) {
	if userID == "" {
		return nil, errors.New("user ID is required")
	}

	if amount <= 0 {
		return nil, errors.New("amount must be greater than zero")
	}

	if description == "" {
		return nil, errors.New("description is required")
	}

	if len(description) > 200 {
		return nil, errors.New("description cannot exceed 200 characters")
	}

	if !isValidCategory(category) {
		return nil, errors.New("invalid category")
	}

	if !isValidPaidBy(paidBy) {
		return nil, errors.New("invalid paid by value")
	}

	now := time.Now()
	return &Expense{
		UserID:      userID,
		Amount:      amount,
		Description: description,
		Category:    category,
		PaidBy:      paidBy,
		IsSettled:   false,
		ExpenseDate: expenseDate,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

// Update updates the expense with validation
func (e *Expense) Update(amount float64, description string, category ExpenseCategory, paidBy PaidBy, expenseDate time.Time) error {
	if amount <= 0 {
		return errors.New("amount must be greater than zero")
	}

	if description == "" {
		return errors.New("description is required")
	}

	if len(description) > 200 {
		return errors.New("description cannot exceed 200 characters")
	}

	if !isValidCategory(category) {
		return errors.New("invalid category")
	}

	if !isValidPaidBy(paidBy) {
		return errors.New("invalid paid by value")
	}

	e.Amount = amount
	e.Description = description
	e.Category = category
	e.PaidBy = paidBy
	e.ExpenseDate = expenseDate
	e.UpdatedAt = time.Now()

	return nil
}

// Settle marks the expense as settled
func (e *Expense) Settle() {
	e.IsSettled = true
	e.UpdatedAt = time.Now()
}

// Unsettle marks the expense as not settled
func (e *Expense) Unsettle() {
	e.IsSettled = false
	e.UpdatedAt = time.Now()
}

func isValidCategory(category ExpenseCategory) bool {
	switch category {
	case CategoryGroceries, CategoryDates, CategoryBills, CategoryEntertainment, CategoryTravel, CategoryOther:
		return true
	default:
		return false
	}
}

func isValidPaidBy(paidBy PaidBy) bool {
	switch paidBy {
	case PaidByMe, PaidByPartner, PaidBySplit:
		return true
	default:
		return false
	}
}
