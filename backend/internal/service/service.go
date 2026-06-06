package service

import (
	"context"
	"fmt"
	"hackathon_MAGAS/internal/config"
	"hackathon_MAGAS/internal/model"
	"hackathon_MAGAS/internal/repository"

	"github.com/go-chi/jwtauth/v5"
	"golang.org/x/crypto/bcrypt"
)

type Service interface {
	Login(context.Context, model.LoginRequest) (string, error)
}

type ServiceImpl struct {
	cfg       *config.Config
	repo      repository.Repository
	tokenAuth *jwtauth.JWTAuth
}

func New(cfg *config.Config, repo repository.Repository, tokenAuth *jwtauth.JWTAuth) ServiceImpl {
	return ServiceImpl{
		cfg,
		repo,
		tokenAuth,
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
