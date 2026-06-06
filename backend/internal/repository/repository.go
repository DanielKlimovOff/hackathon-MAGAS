package repository

import (
	"context"
	"database/sql"
	"fmt"
	"hackathon_MAGAS/internal/model"
)

type Repository interface {
	GetUKByEmailAddress(context.Context, string) (model.UK, error)
	CreateUK(context.Context, model.UK) error
}

type RepositoryImpl struct {
	db *sql.DB
}

func New(db *sql.DB) *RepositoryImpl {
	return &RepositoryImpl{db: db}
}

func (r *RepositoryImpl) GetUKByEmailAddress(ctx context.Context, email string) (model.UK, error) {
	var uk model.UK
	err := r.db.QueryRowContext(ctx, "SELECT id, email, password_hash FROM uks WHERE email = $1", email).Scan(&uk.ID, &uk.Email, &uk.PasswordHash)
	if err != nil {
		if err == sql.ErrNoRows {
			return model.UK{}, fmt.Errorf("%w: uk not found", model.ErrNotFound)
		}
		return model.UK{}, err
	}

	return uk, nil
}

func (r *RepositoryImpl) CreateUK(ctx context.Context, uk model.UK) error {
	_, err := r.db.ExecContext(ctx, "INSERT INTO uks (id, email, password_hash) VALUES ($1, $2, $3)", uk.ID, uk.Email, uk.PasswordHash)
	return err
}
