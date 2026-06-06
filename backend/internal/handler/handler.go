package handler

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"hackathon_MAGAS/internal/config"
	"hackathon_MAGAS/internal/model"
	"hackathon_MAGAS/internal/service"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
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
		SameSite: http.SameSiteStrictMode,
	}
	http.SetCookie(w, authCookie)

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) GetAllUKs(w http.ResponseWriter, r *http.Request) {
	uks, err := h.svc.GetAllUKs(r.Context())
	if err != nil {
		handleError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, uks)
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
		SameSite: http.SameSiteStrictMode,
	}

	http.SetCookie(w, cookie)

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) GenerateConnectCode(w http.ResponseWriter, r *http.Request) {
	var req model.GenerateCodeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		handleError(w, fmt.Errorf("%w: failed to decode request body", model.ErrBadRequest))
		return
	}

	ukClaims, err := getUserClaims(r.Context())
	if err != nil {
		handleError(w, model.ErrUnauthorized)
	}

	code, err := h.svc.GenerateConnectCode(r.Context(), ukClaims, req)
	if err != nil {
		handleError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"code": code})
}

func (h *Handler) NewScreen(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "code")
	if code == "" {
		handleError(w, fmt.Errorf("%w: code is required", model.ErrBadRequest))
		return
	}

	token, err := h.svc.NewScreen(r.Context(), code)
	if err != nil {
		handleError(w, err)
		return
	}

	authCookie := &http.Cookie{
		Name:     "screen_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
	}
	http.SetCookie(w, authCookie)

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) GetAllScreens(w http.ResponseWriter, r *http.Request) {
	ukClaims, err := getUserClaims(r.Context())
	if err != nil {
		handleError(w, model.ErrUnauthorized)
		return
	}

	screens, err := h.svc.GetAllScreens(r.Context(), ukClaims)
	if err != nil {
		handleError(w, err)
	}

	writeJSON(w, http.StatusOK, screens)
}

func (h *Handler) GetBuildings(w http.ResponseWriter, r *http.Request) {
	resp, err := http.Get("https://hck-api.unicorn.icu/api/v1/buildings/get-list-crm/?token=" + h.cfg.UjinToken)
	log.Println("token", h.cfg.UjinToken)
	if err != nil {
		handleError(w, err)
	}
	defer resp.Body.Close()
	w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
	w.WriteHeader(resp.StatusCode)

	_, err = io.Copy(w, resp.Body)
	if err != nil {
		handleError(w, err)
		return
	}
}

func (h *Handler) GetFreeParkingSlots(w http.ResponseWriter, r *http.Request) {
	resp, err := http.Get("https://hck-api.unicorn.icu/api/v1/parking/free?token=" + h.cfg.UjinToken)
	log.Println("token", h.cfg.UjinToken)
	if err != nil {
		handleError(w, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		handleError(w, fmt.Errorf("unexpected status code: %d", resp.StatusCode))
	}

	var req map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		handleError(w, fmt.Errorf("%w: failed to decode request body", model.ErrBadRequest))
		return
	}

	w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
	w.WriteHeader(resp.StatusCode)

	data, ok := req["data"]
	if !ok {
		handleError(w, fmt.Errorf("unexpected response format"))
	}
	items, ok := data.(map[string]interface{})["items"]
	if !ok {
		handleError(w, fmt.Errorf("unexpected response format"))
	}

	count_slots := len(items.([]interface{}))

	writeJSON(w, http.StatusOK, map[string]int{
		"free_slots": count_slots,
	})
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
