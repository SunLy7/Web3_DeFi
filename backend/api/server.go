package api

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"defi/backend/config"
	"defi/backend/events"
	"defi/backend/handlers"
)

// Server 代表API服务器
type Server struct {
	cfg           *config.Config
	eventListener *events.EventListener
	httpServer    *http.Server
	handlers      *handlers.Handlers
}

// NewServer 创建新的API服务器
func NewServer(cfg *config.Config, eventListener *events.EventListener) *Server {
	// 创建处理器
	handlers := handlers.New(cfg, eventListener)
	
	// 创建路由
	mux := http.NewServeMux()
	
	// 注册API路由
	mux.HandleFunc("GET /api/pools", handlers.GetPools)
	mux.HandleFunc("GET /api/pools/{id}", handlers.GetPool)
	mux.HandleFunc("GET /api/transactions", handlers.GetTransactions)
	mux.HandleFunc("GET /api/prices", handlers.GetPrices)
	mux.HandleFunc("GET /api/reserves", handlers.GetReserves)
	
	// WebSocket API
	mux.HandleFunc("GET /ws", handlers.WebSocketHandler)
	
	// 创建HTTP服务器
	httpServer := &http.Server{
		Addr:    cfg.API.Address,
		Handler: corsMiddleware(loggingMiddleware(mux)),
	}
	
	return &Server{
		cfg:           cfg,
		eventListener: eventListener,
		httpServer:    httpServer,
		handlers:      handlers,
	}
}

// Start 启动API服务器
func (s *Server) Start() error {
	// 启动HTTP服务器
	if err := s.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		return err
	}
	return nil
}

// Shutdown 关闭API服务器
func (s *Server) Shutdown(ctx context.Context) error {
	return s.httpServer.Shutdown(ctx)
}

// corsMiddleware 添加CORS头
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		next.ServeHTTP(w, r)
	})
}

// loggingMiddleware 记录请求日志
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}

// respondJSON 发送JSON响应
func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	
	if data != nil {
		if err := json.NewEncoder(w).Encode(data); err != nil {
			log.Printf("Error encoding JSON response: %v", err)
		}
	}
}

// respondError 发送错误响应
func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
} 