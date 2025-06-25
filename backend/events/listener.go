package events

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"sync"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

// 定义事件类型
const (
	EventLiquidityAdded   = "LiquidityAdded"
	EventLiquidityRemoved = "LiquidityRemoved"
	EventSwap             = "Swap"
)

// Event 代表一个区块链事件
type Event struct {
	Type      string         // 事件类型
	TxHash    string         // 交易哈希
	BlockHash string         // 区块哈希
	BlockNum  uint64         // 区块号
	Data      map[string]any // 事件数据
}

// EventListener 区块链事件监听器
type EventListener struct {
	client      *ethclient.Client
	ammAddress  common.Address
	subscribers map[string][]chan Event
	mu          sync.RWMutex
}

// NewEventListener 创建新的事件监听器
func NewEventListener(rpcURL, ammAddress string) (*EventListener, error) {
	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Ethereum node: %w", err)
	}

	return &EventListener{
		client:      client,
		ammAddress:  common.HexToAddress(ammAddress),
		subscribers: make(map[string][]chan Event),
	}, nil
}

// Subscribe 订阅特定类型的事件
func (el *EventListener) Subscribe(eventType string) chan Event {
	el.mu.Lock()
	defer el.mu.Unlock()

	ch := make(chan Event, 10)
	el.subscribers[eventType] = append(el.subscribers[eventType], ch)
	return ch
}

// Unsubscribe 取消订阅特定类型的事件
func (el *EventListener) Unsubscribe(eventType string, ch chan Event) {
	el.mu.Lock()
	defer el.mu.Unlock()

	if chans, ok := el.subscribers[eventType]; ok {
		for i, c := range chans {
			if c == ch {
				el.subscribers[eventType] = append(chans[:i], chans[i+1:]...)
				close(ch)
				break
			}
		}
	}
}

// publish 将事件发送给所有订阅者
func (el *EventListener) publish(event Event) {
	el.mu.RLock()
	defer el.mu.RUnlock()

	// 发送到特定类型订阅者
	if chans, ok := el.subscribers[event.Type]; ok {
		for _, ch := range chans {
			ch <- event
		}
	}

	// 发送到所有事件订阅者
	if chans, ok := el.subscribers["*"]; ok {
		for _, ch := range chans {
			ch <- event
		}
	}
}

// Start 开始监听区块链事件
func (el *EventListener) Start(ctx context.Context) error {
	// 创建查询过滤器
	query := ethereum.FilterQuery{
		Addresses: []common.Address{el.ammAddress},
	}

	// 创建日志通道
	logs := make(chan types.Log)
	defer close(logs)

	// 订阅日志事件
	sub, err := el.client.SubscribeFilterLogs(ctx, query, logs)
	if err != nil {
		return fmt.Errorf("failed to subscribe to logs: %w", err)
	}
	defer sub.Unsubscribe()

	// 处理日志事件
	for {
		select {
		case <-ctx.Done():
			return nil
		case err := <-sub.Err():
			log.Printf("Subscription error: %v", err)
			return err
		case vLog := <-logs:
			// 解析事件
			event, err := el.parseEvent(vLog)
			if err != nil {
				log.Printf("Failed to parse event: %v", err)
				continue
			}

			// 分发事件
			el.publish(event)
		}
	}
}

// parseEvent 解析区块链日志为事件
func (el *EventListener) parseEvent(vLog types.Log) (Event, error) {
	event := Event{
		TxHash:    vLog.TxHash.Hex(),
		BlockHash: vLog.BlockHash.Hex(),
		BlockNum:  vLog.BlockNumber,
		Data:      make(map[string]any),
	}

	// 根据事件签名识别事件类型
	switch vLog.Topics[0].Hex() {
	case "0x36a0671bb3af54336d9479c0a388118bd9d7b0d47988b8a5a53b5719b5d24c3a": // LiquidityAdded
		event.Type = EventLiquidityAdded
		event.Data["provider"] = common.HexToAddress(vLog.Topics[1].Hex()).Hex()
		event.Data["amountA"] = new(big.Int).SetBytes(vLog.Data[:32])
		event.Data["amountB"] = new(big.Int).SetBytes(vLog.Data[32:64])
		event.Data["liquidity"] = new(big.Int).SetBytes(vLog.Data[64:96])

	case "0x0dcd8b42a760e2e564bb9a81ae33dae2c3402eab720d2594fbecfa74ba301211": // LiquidityRemoved
		event.Type = EventLiquidityRemoved
		event.Data["provider"] = common.HexToAddress(vLog.Topics[1].Hex()).Hex()
		event.Data["amountA"] = new(big.Int).SetBytes(vLog.Data[:32])
		event.Data["amountB"] = new(big.Int).SetBytes(vLog.Data[32:64])
		event.Data["liquidity"] = new(big.Int).SetBytes(vLog.Data[64:96])

	case "0xeb869a7dee7324455c86f9a2d2c6f3ddd4b4bc9b6001a6ecd225ed27baceb9d3": // Swap
		event.Type = EventSwap
		event.Data["sender"] = common.HexToAddress(vLog.Topics[1].Hex()).Hex()
		event.Data["amountIn"] = new(big.Int).SetBytes(vLog.Data[:32])
		event.Data["amountOut"] = new(big.Int).SetBytes(vLog.Data[32:64])
		event.Data["isAToB"] = vLog.Data[95] == 1 // 最后一个字节表示交易方向

	default:
		return event, fmt.Errorf("unknown event type: %s", vLog.Topics[0].Hex())
	}

	return event, nil
} 