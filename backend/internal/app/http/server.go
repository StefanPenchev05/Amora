package http

import (
	"context"
	"fmt"
	"net/http"

	"github.com/StefanPenchev05/Amora/backend/internal/config"
)

type Server struct {
	httpServer *http.Server
	config     *config.Config
}

// Constructor
func NewServer(config *config.Config, router Router) HTTPServer {
	return &Server{
		config: config,
		httpServer: &http.Server{
			Addr:         fmt.Sprintf(":%s", config.Server.Port),
			Handler:      router.Handler(),
			ReadTimeout:  config.Server.ReadTimeout,
			WriteTimeout: config.Server.WriteTimeout,
			IdleTimeout:  config.Server.IdleTimeout,
		},
	}
}

func (s *Server) Start() error {
	return s.httpServer.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	return s.httpServer.Shutdown(ctx)
}
