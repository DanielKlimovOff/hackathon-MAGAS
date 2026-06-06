package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"hackathon_MAGAS/internal/config"
	"hackathon_MAGAS/internal/model"
	"hackathon_MAGAS/internal/rediska"
	"hackathon_MAGAS/internal/repository"

	"github.com/go-chi/jwtauth/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Service interface {
	Login(context.Context, model.LoginRequest) (string, error)
	Register(context.Context, model.RegisterRequest) (string, error)
	GetAllUKs(context.Context) ([]model.UK, error)
	GenerateConnectCode(context.Context, model.UKClaims, model.GenerateCodeRequest) (string, error)
	NewScreen(context.Context, string) (string, error)
	GetAllScreens(context.Context, model.UKClaims) ([]model.Screen, error)
}

type ServiceImpl struct {
	cfg       *config.Config
	repo      repository.Repository
	tokenAuth *jwtauth.JWTAuth
	rediska   rediska.Rediska
}

func New(cfg *config.Config, repo repository.Repository, tokenAuth *jwtauth.JWTAuth, rediska rediska.Rediska) *ServiceImpl {
	return &ServiceImpl{
		cfg,
		repo,
		tokenAuth,
		rediska,
	}
}

func (s ServiceImpl) Login(ctx context.Context, req model.LoginRequest) (string, error) {
	uk, err := s.repo.GetUKByEmailAddress(ctx, req.Login)
	if err != nil {
		return "", err
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(uk.PasswordHash),
		[]byte(req.Password),
	)

	if err != nil {
		return "", fmt.Errorf("%w: invalid password", model.ErrUnauthorized)
	}

	_, token, err := s.tokenAuth.Encode(map[string]interface{}{"id": uk.ID})
	if err != nil {
		return "", err
	}

	return token, nil
}

func (s ServiceImpl) Register(ctx context.Context, req model.RegisterRequest) (string, error) {
	var uk model.UK
	uk, err := s.repo.GetUKByEmailAddress(ctx, req.Email)
	if err != nil {
		if !errors.Is(err, model.ErrNotFound) {
			return "", err
		} else {
			hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
			if err != nil {
				return "", err
			}
			uk = model.UK{
				ID:           uuid.New(),
				Email:        req.Email,
				PasswordHash: string(hash),
			}
			err = s.repo.CreateUK(ctx, uk)
			if err != nil {
				return "", err
			}
		}
	}
	_, token, err := s.tokenAuth.Encode(map[string]interface{}{"id": uk.ID})
	if err != nil {
		return "", err
	}

	return token, nil
}

func (s ServiceImpl) GetAllUKs(ctx context.Context) ([]model.UK, error) {
	return s.repo.GetAllUKs(ctx)
}

func (s ServiceImpl) GenerateConnectCode(ctx context.Context, ukClaims model.UKClaims, req model.GenerateCodeRequest) (string, error) {
	code, err := s.rediska.GetString(ctx, ukClaims.ID.String())
	if err != nil {
		return "", err
	}
	if code == "" {
		code = uuid.New().String()[:6]
		if err := s.rediska.Set(ctx, ukClaims.ID.String(), code, s.cfg.ConnectCodeTTL); err != nil {
			return "", err
		}
		claims := model.ScreenCodeClaims{
			UKID:       ukClaims.ID,
			BuildingID: req.BuildingID,
		}
		data, err := json.Marshal(claims)
		if err != nil {
			return "", err
		}
		if err := s.rediska.Set(ctx, code, data, s.cfg.ConnectCodeTTL); err != nil {
			return "", err
		}
	}
	return code, nil
}

func (s ServiceImpl) NewScreen(ctx context.Context, code string) (string, error) {
	data, err := s.rediska.GetBytes(ctx, code)

	if err != nil || len(data) == 0 {
		return "", model.ErrNotFound
	}

	var screenClaims model.ScreenCodeClaims
	err = json.Unmarshal(data, &screenClaims)
	if err != nil {
		return "", err
	}

	screen := model.Screen{
		ID:          uuid.New(),
		Name:        "New Screen",
		Description: "",
		UKID:        screenClaims.UKID,
		BuildingID:  screenClaims.BuildingID,
		Status:      "waiting",
		TemplateID:  nil,
		Alert:       nil,
	}

	err = s.repo.CreateScreen(ctx, screen)
	if err != nil {
		return "", err
	}

	_, token, err := s.tokenAuth.Encode(map[string]interface{}{"id": screen.ID})
	if err != nil {
		return "", err
	}

	return token, nil
}

func (s ServiceImpl) GetAllScreens(ctx context.Context, ukClaims model.UKClaims) ([]model.Screen, error) {
	return s.repo.GetAllScreensByUKID(ctx, ukClaims.ID)
}
