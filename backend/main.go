package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"defi/backend/api"
	"defi/backend/config"
	"defi/backend/events"
)

func main() {
	// 加载配置
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 创建上下文
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 初始化区块链事件监听
	eventListener, err := events.NewEventListener(cfg.RPC.URL, cfg.Contracts.AMMAddress)
	if err != nil {
		log.Fatalf("Failed to initialize event listener: %v", err)
	}

	// 启动事件监听
	go func() {
		if err := eventListener.Start(ctx); err != nil {
			log.Printf("Event listener error: %v", err)
		}
	}()

	// 初始化API服务
	apiServer := api.NewServer(cfg, eventListener)
	
	// 启动API服务
	go func() {
		if err := apiServer.Start(); err != nil {
			log.Printf("API server error: %v", err)
		}
	}()

	log.Printf("DeFi backend started. API server listening on %s", cfg.API.Address)

	// 等待终止信号
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down DeFi backend...")

	// 关闭API服务
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()
	
	if err := apiServer.Shutdown(shutdownCtx); err != nil {
		log.Printf("API server shutdown error: %v", err)
	}

	// 关闭事件监听
	cancel()
	
	log.Println("DeFi backend stopped")
} 