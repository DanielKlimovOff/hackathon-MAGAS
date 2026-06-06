package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port      string
	JWTSecret string

	DatabaseDSN        string
	DatabaseDriverName string
}

func Load() (*Config, error) {
        // Пытаемся загрузить .env для локальной разработки.
	// Если файла .env нет — не падаем, потому что в Docker
	// переменные приходят из compose.yaml.
	_ = godotenv.Load()

	port := getEnv("PORT")
	jwtSecret := getEnv("JWT_SECRET")

	dbDsn := getEnv("DATABASE_DSN")
	dbDriver := getEnv("DATABASE_DRIVER")

	return &Config{
		Port:               port,
		JWTSecret:          jwtSecret,
		DatabaseDSN:        dbDsn,
		DatabaseDriverName: dbDriver,
	}, nil
}

func getEnv(key string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	panic("Environment variable " + key + " is required but not set")
}
