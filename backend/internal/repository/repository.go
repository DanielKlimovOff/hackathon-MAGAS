package repository

import (
	"context"
	"database/sql"
	"fmt"
	"hackathon_MAGAS/internal/model"

	"github.com/google/uuid"
)

type Repository interface {
	GetUKByEmailAddress(context.Context, string) (model.UK, error)
	CreateUK(context.Context, model.UK) error
	CreateScreen(context.Context, model.Screen) error
	GetAllScreensByUKID(context.Context, uuid.UUID) ([]model.Screen, error)
	GetAllUKs(context.Context) ([]model.UK, error)
	CreateTemplate(context.Context, model.Template) error
	CreateWidget(context.Context, model.Widget) error
}

type RepositoryImpl struct {
	db *sql.DB
}

func New(db *sql.DB) *RepositoryImpl {
	return &RepositoryImpl{db: db}
}

func (r *RepositoryImpl) GetAllUKs(ctx context.Context) ([]model.UK, error) {
	rows, err := r.db.QueryContext(ctx, "SELECT id, email, password_hash FROM uks")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	uks := make([]model.UK, 0)
	for rows.Next() {
		var uk model.UK
		err = rows.Scan(&uk.ID, &uk.Email, &uk.PasswordHash)
		if err != nil {
			return nil, err
		}
		uks = append(uks, uk)
	}

	return uks, nil
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

func (r *RepositoryImpl) CreateScreen(ctx context.Context, screen model.Screen) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO screens (id, name, description,
		uk_id, building_id, status, template_id, alert)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		screen.ID, screen.Name, screen.Description,
		screen.UKID, screen.BuildingID, screen.Status,
		screen.TemplateID, screen.Alert)
	if err != nil {
		return err
	}
	return nil
}

func (r *RepositoryImpl) GetAllScreensByUKID(ctx context.Context, ukID uuid.UUID) ([]model.Screen, error) {
	rows, err := r.db.QueryContext(ctx, "SELECT id, name, description, uk_id, building_id, status, template_id, alert FROM screens WHERE uk_id = $1", ukID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	screens := make([]model.Screen, 0)
	for rows.Next() {
		var screen model.Screen
		err = rows.Scan(&screen.ID, &screen.Name, &screen.Description, &screen.UKID, &screen.BuildingID, &screen.Status, &screen.TemplateID, &screen.Alert)
		if err != nil {
			return nil, err
		}
		screens = append(screens, screen)
	}

	return screens, nil
}

func (r *RepositoryImpl) CreateTemplate(ctx context.Context, template model.Template) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO templates (id, uk_id)`,
		template.ID, template.UKID)
	if err != nil {
		return err
	}
	return nil
}

func (r *RepositoryImpl) CreateWidget(ctx context.Context, widget model.Widget) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO widgets (id, name, url, x, y, width, height)`,
		widget.ID, widget.Name, widget.URL, widget.X, widget.Y, widget.Width, widget.Height)
	if err != nil {
		return err
	}

	return nil
}
