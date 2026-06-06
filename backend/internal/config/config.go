package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port      string
	JWTSecret string

	DatabaseDSN        string
	DatabaseDriverName string

	RedisAddr      string
	RedisPassword  string
	RedisDB        int
	RedisProtocol  int
	ConnectCodeTTL int

	UjinToken string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	port := getEnv("PORT")
	jwtSecret := getEnv("JWT_SECRET")

	dbDsn := getEnv("DATABASE_DSN")
	dbDriver := getEnv("DATABASE_DRIVER")

	redisAddr := getEnv("REDIS_ADDR")
	redisPassword := getEnv("REDIS_PASSWORD")
	redisDB, err := strconv.Atoi(getEnv("REDIS_DB"))
	if err != nil {
		panic(err)
	}
	protocol, err := strconv.Atoi(getEnv("REDIS_PROTOCOL"))
	if err != nil {
		panic(err)
	}

	connectCodeTTL, err := strconv.Atoi(getEnv("CONNECT_CODE_TTL"))
	if err != nil {
		panic(err)
	}

	ujinToken := getEnv("UJIN_TOKEN")

	return &Config{
		Port:               port,
		JWTSecret:          jwtSecret,
		DatabaseDSN:        dbDsn,
		DatabaseDriverName: dbDriver,
		RedisAddr:          redisAddr,
		RedisPassword:      redisPassword,
		RedisDB:            redisDB,
		RedisProtocol:      protocol,
		ConnectCodeTTL:     connectCodeTTL,
		UjinToken:          ujinToken,
	}, nil
}

func getEnv(key string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	panic("Environment variable " + key + " is required but not set")
}
