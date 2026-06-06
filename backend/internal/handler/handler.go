package handler

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"hackathon_MAGAS/internal/config"
	"hackathon_MAGAS/internal/model"
	"hackathon_MAGAS/internal/service"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/jwtauth/v5"
	"github.com/google/uuid"
)

type Handler struct {
	cfg *config.Config
	svc service.Service
}

func New(cfg *config.Config, svc service.Service) *Handler {
	return &Handler{cfg: cfg, svc: svc}
}

func (h *Handler) healthz(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req model.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		handleError(w, fmt.Errorf("%w: failed to decode request body", model.ErrBadRequest))
		return
	}

	token, err := h.svc.Login(r.Context(), req)
	if err != nil {
		handleError(w, err)
		return
	}

	authCookie := &http.Cookie{
		Name:     "auth_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	}
	http.SetCookie(w, authCookie)

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req model.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		handleError(w, fmt.Errorf("%w: failed to decode request body", model.ErrBadRequest))
		return
	}

	token, err := h.svc.Register(r.Context(), req)
	if err != nil {
		handleError(w, err)
		return
	}

	authCookie := &http.Cookie{
		Name:     "auth_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	}
	http.SetCookie(w, authCookie)

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	cookie := &http.Cookie{
		Name:     "auth_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	}

	http.SetCookie(w, cookie)

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) GetConnectCode(w http.ResponseWriter, r *http.Request) {
	ukClaims, err := getUserClaims(r.Context())
	if err != nil {
		handleError(w, model.ErrUnauthorized)
	}

	code, err := h.svc.GetConnectCode(r.Context(), ukClaims)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"code": code})
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func handleError(w http.ResponseWriter, err error) {
	log.Printf("ERROR: %v\n", err)
	switch {
	case errors.Is(err, model.ErrNotFound):
		http.Error(w, err.Error(), http.StatusNotFound)
	case errors.Is(err, model.ErrBadRequest):
		http.Error(w, err.Error(), http.StatusBadRequest)
	case errors.Is(err, model.ErrUnauthorized):
		http.Error(w, err.Error(), http.StatusUnauthorized)
	case errors.Is(err, model.ErrForbidden):
		http.Error(w, err.Error(), http.StatusForbidden)

	default:
		http.Error(w, "internal error", http.StatusInternalServerError)
	}
}

func getUserClaims(ctx context.Context) (model.UKClaims, error) {
	_, claims, err := jwtauth.FromContext(ctx)
	if err != nil {
		return model.UKClaims{}, err
	}

	userID, err := uuid.Parse(claims["id"].(string))
	if err != nil {
		return model.UKClaims{}, err
	}

	ukClaims := model.UKClaims{
		ID: userID,
	}

	return ukClaims, nil
}
