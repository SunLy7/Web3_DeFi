package config

import (
	"encoding/json"
	"os"
	"path/filepath"
)

// Config 应用程序配置
type Config struct {
	API struct {
		Address string `json:"address"`
	} `json:"api"`
	
	RPC struct {
		URL string `json:"url"`
	} `json:"rpc"`
	
	DB struct {
		Path string `json:"path"`
	} `json:"db"`
	
	Contracts struct {
		AMMAddress        string `json:"ammAddress"`
		TokenAAddress     string `json:"tokenAAddress"`
		TokenBAddress     string `json:"tokenBAddress"`
		StakingAddress    string `json:"stakingAddress"`
	} `json:"contracts"`
}

// Load 从文件加载配置
func Load() (*Config, error) {
	// 默认配置
	cfg := &Config{}
	cfg.API.Address = ":8080"
	cfg.RPC.URL = "http://localhost:8545"
	cfg.DB.Path = "./data.db"
	
	// 检查配置文件是否存在
	configFile := "./config.json"
	if _, err := os.Stat(configFile); os.IsNotExist(err) {
		// 如果不存在，创建默认配置文件
		if err := saveConfig(cfg, configFile); err != nil {
			return nil, err
		}
		return cfg, nil
	}
	
	// 读取配置文件
	data, err := os.ReadFile(configFile)
	if err != nil {
		return nil, err
	}
	
	// 解析JSON配置
	if err := json.Unmarshal(data, cfg); err != nil {
		return nil, err
	}
	
	return cfg, nil
}

// saveConfig 保存配置到文件
func saveConfig(cfg *Config, path string) error {
	// 确保目录存在
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	
	// 序列化为JSON
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	
	// 写入文件
	return os.WriteFile(path, data, 0644)
} 