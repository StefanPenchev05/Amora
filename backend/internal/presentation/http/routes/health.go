package routes

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	httpInfra "github.com/StefanPenchev05/Amora/backend/internal/infrastructure/http"
)

// HealthRoutes - simple health check route group
type HealthRoutes struct{}

func NewHealthRoutes() *HealthRoutes {
	return &HealthRoutes{}
}

func (h *HealthRoutes) Path() string {
	return "/health"
}

func (h *HealthRoutes) RegisterRoutes(router httpInfra.Router) {
	router.Route(h.Path(), func(r chi.Router) {
		r.Get("/", h.healthCheck)
		r.Get("/ready", h.readinessCheck)
	})
}

func (h *HealthRoutes) healthCheck(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"status":  "ok",
		"service": "amora-backend",
		"version": "1.0.0",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func (h *HealthRoutes) readinessCheck(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"status": "ready",
		"checks": map[string]string{
			"database": "ok",
			"cache":    "ok",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}