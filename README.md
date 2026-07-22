# Семейное древо

Веб-приложение для семейной родословной: деревья с несколькими участниками и ролями, биография и
хроника жизни каждого человека, фото/медиа-архив, инвайты по ссылке, публичный каталог открытых
деревьев, «Жеті ата» (казахская традиция — семь поколений строго по мужской линии) и журнал
изменений по каждому дереву.

**Живая демка:** [familytree-two-phi.vercel.app](https://familytree-two-phi.vercel.app)
Публичное дерево-пример (без регистрации, через «Открытые деревья» в каталоге): британская
королевская семья, 20 персон, 3 поколения.

## Что внутри

| Часть | Стек | Папка |
|---|---|---|
| Backend | Django 6 + DRF, PostgreSQL (JSONB), JWT (simplejwt) | [`familytree-backend/`](familytree-backend) |
| Frontend | React 19 + Vite + Tailwind CSS v4 | [`familytree-frontend/`](familytree-frontend) |
| Mobile | Expo / React Native | [`familytree-mobile/`](familytree-mobile) |

### Возможности

- **Деревья и роли** — владелец/редактор/читатель на каждое дерево (`TreeMember`), приватность
  `private` / `по ссылке` / `public` (видно в общем каталоге).
- **Персоны** — имя, отчество, пол, даты рождения/смерти, место, биография, фото, произвольные
  дополнительные поля (JSONB `extra_data` — не нужно менять схему БД под каждое новое поле).
- **Хроника жизни** — отдельные датированные события на персону (`LifeEvent`), общая лента семьи на
  `/trees/:id/timeline` с фильтрами (период, тип события, живые/ушедшие, только с фото).
- **Родственные связи** — parent/spouse/sibling; предки/потомки считаются рекурсивным SQL
  (`WITH RECURSIVE`), а не в Python — быстро даже на больших деревьях.
- **«Жеті ата»** — отдельный фильтр хронологии: семь поколений предков строго по мужской линии.
  Требует заполненного `Person.gender` у всех звеньев цепочки; на первом человеке без пола цепочка
  честно обрывается, а не выдаёт неверный результат.
- **Медиа-галерея** на персону — сканы, старые фото, документы, отдельно от основного портрета.
- **Инвайты по ссылке** и управление участниками дерева (список, роли, удаление).
- **Журнал изменений** (`AuditLog`) и **уведомления** — кто, что и когда поменял в дереве.
- **Публичный каталог** открытых деревьев — доступен любому авторизованному пользователю.
- **Swagger/Redoc** — вся API-схема автогенерируется (`drf-spectacular`), задокументирован каждый
  эндпоинт.

## Быстрый старт

### Вариант 1 — Docker (весь стек одной командой)

Нужен только Docker. Поднимает Postgres, backend и frontend разом.

```bash
cd familytree-backend
cp .env.example .env   # или создайте вручную, см. SETUP_LOCAL.md
cd ..
docker compose up -d --build
```

- Фронтенд: http://localhost:3000
- API / админка / Swagger: http://localhost:8000 (`/admin/`, `/api/docs/`)

Подробности и troubleshooting — [`DEPLOY.md`](DEPLOY.md).

### Вариант 2 — без Docker, для разработки

Backend: [`familytree-backend/SETUP_LOCAL.md`](familytree-backend/SETUP_LOCAL.md) (Python,
PostgreSQL, `.env`, миграции, `runserver`).

Frontend: [`familytree-frontend/README.md`](familytree-frontend/README.md) (`npm install && npm run dev`,
бэкенд ожидается на `localhost:8000`).

Mobile: `cd familytree-mobile && npm install && npx expo start`.

## Деплой в интернет (бесплатно)

Схема на трёх бесплатных сервисах: **Vercel** (frontend) + **Render** (backend, по `Dockerfile`) +
**Neon** (serverless PostgreSQL). Пошагово — [`DEPLOY.md`](DEPLOY.md).

## Тесты

```bash
cd familytree-backend
pytest                # ~96% покрытия по trees/users
```

```bash
cd familytree-frontend
npm run test          # vitest
```

## Структура репозитория

```
familytree-backend/    Django REST API (trees, users)
familytree-frontend/   React SPA
familytree-mobile/     Expo-приложение
docker-compose.yml     Локальный запуск всего стека
DEPLOY.md              Docker + бесплатный облачный деплой
```
