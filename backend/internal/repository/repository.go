package repository

import (
	"context"
	"database/sql"
	"fmt"
	"hackathon_MAGAS/internal/model"
)

type Repository interface {
	GetUKByEmailAddress(context.Context, string) (model.UK, error)
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
