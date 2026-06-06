include .env

migrate-new:
	migrate create -ext sql -dir migrations $(NAME)

migrate-up:
	migrate -path ./migrations -database "$(DATABASE_MIGRATE_URL)" up

migrate-down:
	migrate -path ./migrations -database "$(DATABASE_MIGRATE_URL)" down

migrate-drop:
	migrate -path ./migrations -database "$(DATABASE_MIGRATE_URL)" drop

redis-up:
	sudo docker run --name my-redis -p 6379:6379 -d redis

run:
	go run cmd/api/main.go

test:
	sudo go test -v ./integration/...

PHONY: migrate-new migrate-up migrate-down migrate-drop run redis-up