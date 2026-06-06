package service

import (
	"context"
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
	GetConnectCode(context.Context, model.UKClaims) (string, error)
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
	uk, err := s.repo.GetUKByEmailAddress(ctx, req.Email)
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

func (s ServiceImpl) GetConnectCode(ctx context.Context, ukClaims model.UKClaims) (string, error) {
	code, err := s.rediska.Get(ctx, ukClaims.ID.String())
	if err != nil {
		return "", err
	}
	if code == "" {
		code = uuid.New().String()[:6]
		if err := s.rediska.Set(ctx, ukClaims.ID.String(), code, s.cfg.ConnectCodeTTL); err != nil {
			return "", err
		}
	}
	return code, nil
}
