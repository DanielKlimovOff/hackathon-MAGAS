package model

import (
	"errors"

	"github.com/google/uuid"
)

var ErrNotFound = errors.New("not found")
var ErrBadRequest = errors.New("bad request")
var ErrUnauthorized = errors.New("unauthorized")
var ErrForbidden = errors.New("forbidden")

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UK struct {
	ID           uuid.UUID `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"password_hash"`
}

type UKClaims struct {
	ID uuid.UUID `json:"id"`
}

type ScreenCodeClaims struct {
	UKID       uuid.UUID `json:"uk_id"`
	BuildingID int       `json:"building_id"`
}

type GenerateCodeRequest struct {
	BuildingID int `json:"building_id"`
}

type Screen struct {
	ID          uuid.UUID  `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	UKID        uuid.UUID  `json:"uk_id"`
	BuildingID  int        `json:"building_id"`
	Status      string     `json:"status"`
	TemplateID  *uuid.UUID `json:"template_id,omitempty"`
	Alert       *string    `json:"alert,omitempty"`
}
