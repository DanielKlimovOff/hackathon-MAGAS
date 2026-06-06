package main

import (
	"database/sql"
	"hackathon_MAGAS/internal/config"
	"hackathon_MAGAS/internal/handler"
	"hackathon_MAGAS/internal/repository"
	"hackathon_MAGAS/internal/service"
	"log"
	"net/http"

	"github.com/go-chi/jwtauth/v5"
	_ "github.com/lib/pq"
)

// curl -i -X POST localhost:8080/api/v1/register -d '{"email": "daniel@magas.ru", "password": "123"}'
// curl -i -X POST localhost:8080/api/v1/logout -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM2MWQyOTE4LTRiODQtNDc3MC04ZmU1LTdiNjY1OTZhMWFjZiJ9.sDcMhh7U29sryAoQfkkmStTaHOdNUnYMBZFnYykMt28"

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

	repo := repository.New(db)
	svc := service.New(cfg, repo, tokenAuth)
	h := handler.New(cfg, svc)

	addr := ":" + cfg.Port
	log.Printf("listening on %s", addr)
	if err := http.ListenAndServe(addr, h.Router(tokenAuth)); err != nil {
		log.Fatal(err)
	}
}
