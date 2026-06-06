package rediska

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type Rediska interface {
	Set(ctx context.Context, key string, value interface{}, ttl int) error
	Get(ctx context.Context, key string) (string, error)
}

type RediskaImpl struct {
	rdb *redis.Client
}

func New(rdb *redis.Client) *RediskaImpl {
	return &RediskaImpl{rdb: rdb}
}

func (r RediskaImpl) Set(ctx context.Context, key string, value interface{}, ttl int) error {
	if err := r.rdb.Set(ctx, key, value, time.Duration(ttl)*time.Second).Err(); err != nil {
		return err
	}
	return nil
}

func (r RediskaImpl) Get(ctx context.Context, key string) (string, error) {
	value, err := r.rdb.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return "", nil
		}
	}
	return value, nil
}
