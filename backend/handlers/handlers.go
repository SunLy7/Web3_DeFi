package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"sync"

	"github.com/gorilla/websocket"

	"defi/backend/config"
	"defi/backend/events"
)

// Handlers 处理API请求的处理器集合
type Handlers struct {
	cfg           *config.Config
	eventListener *events.EventListener
	clients       map[*websocket.Conn]bool
	clientsMtx    sync.Mutex
	upgrader      websocket.Upgrader
}

// 返回的数据模型
type (
	// Pool 代表流动性池信息
	Pool struct {
		ID           string `json:"id"`
		TokenA       string `json:"tokenA"`
		TokenB       string `json:"tokenB"`
		ReserveA     string `json:"reserveA"`
		ReserveB     string `json:"reserveB"`
		TotalLiquidity string `json:"totalLiquidity"`
		APR          float64 `json:"apr"`
	}

	// Transaction 代表交易信息
	Transaction struct {
		ID        string                 `json:"id"`
		Type      string                 `json:"type"`
		Timestamp int64                  `json:"timestamp"`
		TxHash    string                 `json:"txHash"`
		Data      map[string]interface{} `json:"data"`
	}

	// PriceData 代表价格数据
	PriceData struct {
		TokenA     string  `json:"tokenA"`
		TokenB     string  `json:"tokenB"`
		PriceAinB  float64 `json:"priceAinB"`
		PriceBinA  float64 `json:"priceBinA"`
		Change24h  float64 `json:"change24h"`
		Volume24h  float64 `json:"volume24h"`
		Timestamp  int64   `json:"timestamp"`
	}
)

// New 创建新的处理器
func New(cfg *config.Config, eventListener *events.EventListener) *Handlers {
	h := &Handlers{
		cfg:           cfg,
		eventListener: eventListener,
		clients:       make(map[*websocket.Conn]bool),
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				return true // 允许所有来源的WebSocket连接
			},
		},
	}

	// 订阅事件，推送给WebSocket客户端
	go h.subscribeEvents()

	return h
}

// subscribeEvents 订阅区块链事件并发送给WebSocket客户端
func (h *Handlers) subscribeEvents() {
	eventCh := h.eventListener.Subscribe("*") // 订阅所有事件
	for event := range eventCh {
		h.broadcastToClients(event)
	}
}

// broadcastToClients 向所有WebSocket客户端广播事件
func (h *Handlers) broadcastToClients(event events.Event) {
	h.clientsMtx.Lock()
	defer h.clientsMtx.Unlock()

	for client := range h.clients {
		err := client.WriteJSON(event)
		if err != nil {
			log.Printf("Error sending WebSocket message: %v", err)
			client.Close()
			delete(h.clients, client)
		}
	}
}

// GetPools 返回所有流动性池信息
func (h *Handlers) GetPools(w http.ResponseWriter, r *http.Request) {
	// 这里应该从数据库或区块链查询实际的池信息
	// 现在返回示例数据
	pools := []Pool{
		{
			ID:             "1",
			TokenA:         h.cfg.Contracts.TokenAAddress,
			TokenB:         h.cfg.Contracts.TokenBAddress,
			ReserveA:       "1000000000000000000000", // 1000 TokenA
			ReserveB:       "2000000000000000000000", // 2000 TokenB
			TotalLiquidity: "1414213562373095048801", // sqrt(1000*2000)
			APR:            5.2,
		},
	}

	respondJSON(w, http.StatusOK, pools)
}

// GetPool 返回特定流动性池信息
func (h *Handlers) GetPool(w http.ResponseWriter, r *http.Request) {
	// 获取路径参数
	poolID := r.PathValue("id")

	// 根据ID查询池信息
	// 这里返回示例数据
	pool := Pool{
		ID:             poolID,
		TokenA:         h.cfg.Contracts.TokenAAddress,
		TokenB:         h.cfg.Contracts.TokenBAddress,
		ReserveA:       "1000000000000000000000", // 1000 TokenA
		ReserveB:       "2000000000000000000000", // 2000 TokenB
		TotalLiquidity: "1414213562373095048801", // sqrt(1000*2000)
		APR:            5.2,
	}

	respondJSON(w, http.StatusOK, pool)
}

// GetTransactions 返回交易历史
func (h *Handlers) GetTransactions(w http.ResponseWriter, r *http.Request) {
	// 分页参数
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	if page <= 0 {
		page = 1
	}
	if limit <= 0 || limit > 100 {
		limit = 10
	}

	// 这里返回示例数据
	transactions := []Transaction{
		{
			ID:        "1",
			Type:      events.EventSwap,
			Timestamp: 1684049687,
			TxHash:    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
			Data: map[string]interface{}{
				"sender":    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
				"amountIn":  "1000000000000000000", // 1 TokenA
				"amountOut": "1950495049504950495", // ~1.95 TokenB
				"isAToB":    true,
			},
		},
		{
			ID:        "2",
			Type:      events.EventLiquidityAdded,
			Timestamp: 1684039687,
			TxHash:    "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
			Data: map[string]interface{}{
				"provider":  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
				"amountA":   "100000000000000000000", // 100 TokenA
				"amountB":   "200000000000000000000", // 200 TokenB
				"liquidity": "141421356237309504880", // sqrt(100*200)
			},
		},
	}

	respondJSON(w, http.StatusOK, transactions)
}

// GetPrices 返回价格数据
func (h *Handlers) GetPrices(w http.ResponseWriter, r *http.Request) {
	// 这里返回示例价格数据
	priceData := PriceData{
		TokenA:    h.cfg.Contracts.TokenAAddress,
		TokenB:    h.cfg.Contracts.TokenBAddress,
		PriceAinB: 2.0,  // 1 TokenA = 2 TokenB
		PriceBinA: 0.5,  // 1 TokenB = 0.5 TokenA
		Change24h: 3.5,  // +3.5%
		Volume24h: 150000,
		Timestamp: 1684049687,
	}

	respondJSON(w, http.StatusOK, priceData)
}

// GetReserves 返回储备量数据
func (h *Handlers) GetReserves(w http.ResponseWriter, r *http.Request) {
	// 这里返回示例储备量数据
	reserves := map[string]string{
		"reserveA": "1000000000000000000000", // 1000 TokenA
		"reserveB": "2000000000000000000000", // 2000 TokenB
	}

	respondJSON(w, http.StatusOK, reserves)
}

// WebSocketHandler 处理WebSocket连接
func (h *Handlers) WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	// 升级HTTP连接为WebSocket
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade WebSocket connection: %v", err)
		return
	}

	// 注册客户端
	h.clientsMtx.Lock()
	h.clients[conn] = true
	h.clientsMtx.Unlock()

	// 处理客户端消息
	go h.handleWebSocketClient(conn)
}

// handleWebSocketClient 处理WebSocket客户端连接
func (h *Handlers) handleWebSocketClient(conn *websocket.Conn) {
	defer func() {
		conn.Close()
		
		h.clientsMtx.Lock()
		delete(h.clients, conn)
		h.clientsMtx.Unlock()
	}()

	for {
		// 读取客户端消息
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		// 解析客户端消息
		var msg map[string]interface{}
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf("Error unmarshaling WebSocket message: %v", err)
			continue
		}

		// 处理客户端消息（可以根据需要实现更多功能）
		log.Printf("Received WebSocket message: %v", msg)
	}
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