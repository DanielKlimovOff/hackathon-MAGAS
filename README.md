# hackathon-MAGAS

## Быстрый запуск
1. Клонировать репозиторий
```bash
git clone <URL_РЕПОЗИТОРИЯ>
cd <ПАПКА_ПРОЕКТА>
```
2. Создать `.env` файл
В корне проекта находится файл `.env.example`.
Создайте рабочий файл `.env` по шаблону:
```bash
cp .env.example .env
```
После этого откройте `.env` и при необходимости измените параметры:
`nano .env`
Обычно нужно проверить:
```
NGINX_PORT=80
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=ujin_display
```
Если порт 80 уже занят, можно указать другой порт, например:
`NGINX_PORT=8080`

3. Запустить проект
```
docker compose up -d
```
4. Дождаться запуска контейнеров

Проверить состояние контейнеров:
`docker compose ps`

Посмотреть логи:
`docker compose logs -f`
Когда контейнеры запущены без ошибок, приложение готово к работе.