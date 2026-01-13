package routes

import (
	httpInfra "github.com/StefanPenchev05/Amora/backend/internal/infrastructure/http"
	"github.com/StefanPenchev05/Amora/backend/internal/presentation/http/handlers"
	"github.com/go-chi/chi/v5"
)

type AppRoutes struct {
	relationshipHandler *handlers.RelationshipHandler
	eventHandler        *handlers.EventHandler
	moodHandler         *handlers.MoodHandler
	noteHandler         *handlers.NoteHandler
	memoryHandler       *handlers.MemoryHandler
	expenseHandler      *handlers.ExpenseHandler
	profileHandler      *handlers.ProfileHandler
	authMiddleware      httpInfra.Middleware
}

func NewAppRoutes(
	relationshipHandler *handlers.RelationshipHandler,
	eventHandler *handlers.EventHandler,
	moodHandler *handlers.MoodHandler,
	noteHandler *handlers.NoteHandler,
	memoryHandler *handlers.MemoryHandler,
	expenseHandler *handlers.ExpenseHandler,
	profileHandler *handlers.ProfileHandler,
	authMiddleware httpInfra.Middleware,
) *AppRoutes {
	return &AppRoutes{
		relationshipHandler: relationshipHandler,
		eventHandler:        eventHandler,
		moodHandler:         moodHandler,
		noteHandler:         noteHandler,
		memoryHandler:       memoryHandler,
		expenseHandler:      expenseHandler,
		profileHandler:      profileHandler,
		authMiddleware:      authMiddleware,
	}
}

func (a *AppRoutes) Path() string {
	return "/api"
}

func (a *AppRoutes) RegisterRoutes(router httpInfra.Router) {
	router.Route(a.Path(), func(r chi.Router) {
		if a.authMiddleware != nil {
			r.Use(a.authMiddleware.Handle)
		}

		// Relationship routes
		r.Get("/relationship", a.relationshipHandler.GetStatus)

		// Profile routes
		r.Post("/profile/avatar", a.profileHandler.UpdateAvatar)
		r.Post("/relationship/invite", a.relationshipHandler.CreateInvite)
		r.Post("/relationship/invite/regenerate", a.relationshipHandler.RegenerateInvite)
		r.Post("/relationship/accept", a.relationshipHandler.AcceptInvite)
		r.Post("/relationship/breakup", a.relationshipHandler.BreakUp)

		// Event routes
		r.Post("/events", a.eventHandler.CreateEvent)
		r.Get("/events", a.eventHandler.GetEvents)
		r.Put("/events/{id}", a.eventHandler.UpdateEvent)
		r.Delete("/events/{id}", a.eventHandler.DeleteEvent)

		// Mood routes
		r.Post("/moods", a.moodHandler.CreateMood)
		r.Get("/moods", a.moodHandler.GetMoods)
		r.Put("/moods/{id}", a.moodHandler.UpdateMood)
		r.Delete("/moods/{id}", a.moodHandler.DeleteMood)

		// Note routes
		r.Post("/notes", a.noteHandler.CreateNote)
		r.Get("/notes", a.noteHandler.GetNotes)
		r.Put("/notes/{id}", a.noteHandler.UpdateNote)
		r.Post("/notes/{id}/toggle-pin", a.noteHandler.TogglePin)
		r.Delete("/notes/{id}", a.noteHandler.DeleteNote)

		// Memory routes
		r.Post("/memories", a.memoryHandler.CreateMemory)
		r.Get("/memories", a.memoryHandler.GetMemories)
		r.Put("/memories/{id}", a.memoryHandler.UpdateMemory)
		r.Delete("/memories/{id}", a.memoryHandler.DeleteMemory)

		// Expense routes
		r.Post("/expenses", a.expenseHandler.CreateExpense)
		r.Get("/expenses", a.expenseHandler.GetExpenses)
		r.Put("/expenses/{id}", a.expenseHandler.UpdateExpense)
		r.Post("/expenses/{id}/settle", a.expenseHandler.SettleExpense)
		r.Delete("/expenses/{id}", a.expenseHandler.DeleteExpense)
	})
}
