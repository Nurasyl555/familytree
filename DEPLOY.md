# Деплой

Два сценария: локально одной командой через Docker (весь стек) и бесплатно в интернет (для
учебного/пет-проекта — без платных серверов).

## 1. Локально через Docker (весь стек)

`docker-compose.yml` лежит в корне репозитория и поднимает четыре контейнера: `db` (Postgres),
`redis` (не используется в коде, про запас), `backend` (Django + gunicorn) и `frontend` (React,
собран и отдаётся через nginx, который же проксирует `/api/*` и `/media/*` на `backend`).

Перед первым запуском нужен `familytree-backend/.env` — скопируйте `familytree-backend/.env.example`
(см. также `familytree-backend/SETUP_LOCAL.md`, шаг 3), оттуда backend-контейнер берёт `SECRET_KEY`.
Значения `DB_*` в `.env` не важны для Docker: compose сам подставляет контейнерные (`DB_HOST=db`
и т.п.), не трогая ваш `.env`.

```bash
docker compose up -d --build
```

- Фронтенд: `http://localhost:3000`
- API/админка/Swagger: `http://localhost:8000` (`/admin/`, `/api/docs/`)

```bash
docker compose down        # остановить
docker compose down -v     # остановить и стереть данные (Postgres, media)
docker compose logs -f backend
```

## 2. Бесплатный деплой в интернет

Схема из трёх бесплатных сервисов — ничего не платите, домен вида `*.vercel.app`/`*.onrender.com`
достаточно для учебного проекта:

| Что | Куда | Почему |
|---|---|---|
| Frontend (статика) | **Vercel** (или Netlify/Cloudflare Pages) | Бесплатно навсегда для личных проектов, автодеплой по git push, HTTPS из коробки |
| Backend (Django) | **Render** — free web service, деплой по `Dockerfile` | Бесплатный тариф действительно бесплатный (не триал), умеет собрать ваш `Dockerfile` напрямую |
| База данных | **Neon** — serverless Postgres | Бесплатный тариф не удаляет данные по истечении срока (в отличие от free Postgres на самом Render, который живёт ограниченное время) |

### Шаг 1 — база данных (Neon)

1. Зарегистрироваться на neon.tech, создать проект → получите строку подключения вида
   `postgresql://user:password@host/dbname`.
2. Разберите её на части — они понадобятся как `DB_NAME`/`DB_USER`/`DB_PASSWORD`/`DB_HOST` на шаге 2.

### Шаг 2 — backend (Render)

1. New → Web Service → подключить GitHub-репозиторий.
2. **Docker Build Context Directory**: `familytree-backend`. **Dockerfile Path**:
   `familytree-backend/Dockerfile` (Root Directory при этом оставьте пустым).
3. Environment → добавить переменные:
   ```
   SECRET_KEY=<сгенерировать заново, не тот что в dev .env>
   DEBUG=False
   ALLOWED_HOSTS=<ваш-backend>.onrender.com
   CORS_ALLOWED_ORIGINS=https://<ваш-frontend>.vercel.app
   CSRF_TRUSTED_ORIGINS=https://<ваш-frontend>.vercel.app
   DB_NAME=... DB_USER=... DB_PASSWORD=... DB_HOST=... DB_PORT=5432   # из строки подключения Neon
   DB_SSLMODE=require    # Neon требует SSL, локальный Postgres — нет (там дефолт 'prefer')
   ```
   `ALLOWED_HOSTS` можно заполнить только *после* первого деплоя — Render сам генерирует домен
   (например `familytree-jxp0.onrender.com`), заранее угадать его нельзя. Первый деплой можно
   запустить с заглушкой, поправить `ALLOWED_HOSTS` и передеплоить, когда узнаете реальный домен.
4. **Health Check Path**: `/healthz/` — лёгкий эндпоинт без БД и без генерации Swagger-схемы.
   *Не* используйте `/api/schema/`: `drf-spectacular` пересобирает всю OpenAPI-схему на каждый запрос,
   на бесплатных 0.1 CPU это медленнее 5-секундного таймаута health-check, и Render убивает инстанс
   в бесконечном цикле рестартов.
5. **Docker Command** и **Pre-Deploy Command** оставьте пустыми. Миграции уже зашиты прямо в
   `CMD` `Dockerfile`'а (`sh -c "python manage.py migrate --noinput && gunicorn ..."`) — специально
   не через текстовое поле Render: `Docker Command` на free-тарифе не гарантированно шелл-парсит
   составные команды (`&&`) и может упасть с `sh: ...: not found`, а `Pre-Deploy Command` вообще
   недоступен на free-тарифе.
6. Deploy.

Free-тариф Render засыпает после ~15 минут без запросов и просыпается по первому запросу
(10–50 секунд на «холодный старт») — нормально для пет-проекта, не для продакшена с реальными
пользователями. Файловая система тоже эфемерна — если нужно, чтобы фото переживали передеплой,
понадобится объектное хранилище (Cloudflare R2 + `django-storages`) — отдельная доработка, не входит
в этот деплой.

### Шаг 3 — frontend (Vercel)

1. New Project → тот же репозиторий, Root Directory: `familytree-frontend`, Application Preset: Vite.
2. Environment Variables → `VITE_API_URL=https://<ваш-backend>.onrender.com/api`. `src/api/client.js`
   уже это учитывает: без переменной берётся относительный `/api` (для Docker/dev, где фронт и бэк на
   одном origin), с переменной — абсолютный URL (нужен, когда фронт и бэк на *разных* доменах, как
   тут).
3. Deploy, скопируйте выданный домен (Domains → тот, что помечен как основной, не служебный
   `*-<hash>-<team>.vercel.app`).
4. Вернитесь в Render → Environment → впишите реальный домен фронтенда в `CORS_ALLOWED_ORIGINS`
   (и `CSRF_TRUSTED_ORIGINS`) — сохранение переменной сам запускает передеплой.

Фото/сканы (`Person.photo`, `Media.file`, `LifeEvent.attachment`) отдаются **абсолютным** URL
(DRF строит его из заголовка запроса), так что с раздельными доменами Vercel+Render всё работает
из коробки — специальных доработок сериализаторов не нужно.

### Итог

`https://<ваш-frontend>.vercel.app` — рабочее приложение, `https://<ваш-backend>.onrender.com/admin/`
— админка. Оба обновляются автоматически при `git push` в `main` (если включить авто-деплой в
настройках Vercel/Render).
