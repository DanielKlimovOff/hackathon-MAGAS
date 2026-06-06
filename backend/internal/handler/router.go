package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth/v5"
)

func (h *Handler) Router(tokenAuth *jwtauth.JWTAuth) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://45.155.205.127", "http://localhost:3000", "http://127.0.0.1:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Route("/api/v1", func(r chi.Router) {
		r.Group(func(r chi.Router) {
			r.Get("/healthz", h.healthz)

			r.Get("/uks", h.GetAllUKs)

			r.Post("/login", h.Login)
			r.Post("/register", h.Register)

			r.Get("/screens/new/{code}", h.NewScreen)
		})

		r.Group(func(r chi.Router) {
			r.Use(AuthMiddleware(tokenAuth))

			r.Post("/screens/code", h.GenerateConnectCode)
			r.Get("/screens", h.GetAllScreens)

			r.Get("/buildings", h.GetBuildings)

			r.Post("/logout", h.Logout)
		})
	})
	return r
}

func AuthMiddleware(tokenAuth *jwtauth.JWTAuth) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

			cookie, err := r.Cookie("auth_token")
			if err != nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			token, err := jwtauth.VerifyToken(tokenAuth, cookie.Value)
			if err != nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			ctx := jwtauth.NewContext(r.Context(), token, nil)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
