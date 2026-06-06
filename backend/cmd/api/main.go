package main

import (
	"database/sql"
	"hackathon_MAGAS/internal/config"
	"hackathon_MAGAS/internal/handler"
	"hackathon_MAGAS/internal/rediska"
	"hackathon_MAGAS/internal/repository"
	"hackathon_MAGAS/internal/service"
	"log"
	"net/http"

	"github.com/go-chi/jwtauth/v5"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

// curl -i -X POST http://45.155.205.127/api/v1/register -d '{"email": "daniel@magas.ru", "password": "123"}'
// curl -i -X POST localhost:8080/api/v1/login -d '{"email": "daniel@magas.ru", "password": "123"}'
// curl -i -X POST localhost:8080/api/v1/logout -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM2MWQyOTE4LTRiODQtNDc3MC04ZmU1LTdiNjY1OTZhMWFjZiJ9.sDcMhh7U29sryAoQfkkmStTaHOdNUnYMBZFnYykMt28"
// curl -i -X POST http://45.155.205.127/api/v1/screens/code -d '{"building_id": 167}' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNiYWYwMmIzLThkYjQtNDAwOC05NTcwLTU5ZTgxODBlZmI0YSJ9.ELDl-6dPB1c9kjQ-ykgTctE5Z_rPsQ321Yvy_REPqFk"
// curl -i -X GET localhost:8080/api/v1/screens/new/f300b6
// curl -i -X GET localhost:8080/api/v1/screens -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM2MWQyOTE4LTRiODQtNDc3MC04ZmU1LTdiNjY1OTZhMWFjZiJ9.sDcMhh7U29sryAoQfkkmStTaHOdNUnYMBZFnYykMt28"

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	db, err := sql.Open(cfg.DatabaseDriverName, cfg.DatabaseDSN)
	if err != nil {
		log.Fatalf("Failed to connect to db: %v", err)
	}

	tokenAuth := jwtauth.New("HS256", []byte(cfg.JWTSecret), nil)

	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
		Protocol: cfg.RedisProtocol,
	})

	rediska := rediska.New(rdb)
	repo := repository.New(db)
	svc := service.New(cfg, repo, tokenAuth, rediska)
	h := handler.New(cfg, svc)

	addr := ":" + cfg.Port
	log.Printf("listening on %s", addr)
	if err := http.ListenAndServe(addr, h.Router(tokenAuth)); err != nil {
		log.Fatal(err)
	}
}
