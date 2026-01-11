.PHONY: help build up down logs clean restart frontend backend db

help:
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f postgres

restart:
	docker-compose restart

clean:
	docker-compose down -v --rmi all

frontend:
	docker-compose up -d --build frontend

backend:
	docker-compose up -d --build backend

db-shell:
	docker-compose exec postgres psql -U taskaya_user -d taskaya_db

dev:
	docker-compose -f docker-compose.dev.yml up

dev-down:
	docker-compose -f docker-compose.dev.yml down

push:
	docker-compose push

pull:
	docker-compose pull