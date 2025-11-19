.PHONY: help build up down restart logs clean test

help: ## Показати це повідомлення
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Зібрати Docker images
	@echo "Building Docker images..."
	@docker-compose build --parallel

up: ## Запустити всі сервіси
	@echo "Starting services..."
	@docker-compose up -d

down: ## Зупинити всі сервіси
	@echo "Stopping services..."
	@docker-compose down

restart: down up ## Перезапустити всі сервіси

logs: ## Показати логи додатку
	@docker logs -f familyevening

clean: ## Очистити всі контейнери, образи та volumes
	@echo "Cleaning up..."
	@docker-compose down -v --rmi all
	@docker system prune -f

rebuild: clean build up ## Повна перебудова з очищенням

quick-start: ## Швидкий старт (build + up)
	@echo "Quick starting application..."
	@docker-compose up -d --build

status: ## Показати статус сервісів
	@docker-compose ps

shell: ## Відкрити shell в контейнері
	@docker exec -it familyevening sh

test: ## Тестувати API endpoints
	@echo "Testing backend API..."
	@curl -s http://localhost:3000/api/admin/events | jq

publish: ## Опублікувати образ на Docker Hub (single platform)
	@./docker-publish.sh

publish-version: ## Опублікувати образ з конкретною версією (make publish-version VERSION=v0.3.0)
	@./docker-publish.sh $(VERSION)

publish-multi: ## Опублікувати multi-platform образ (amd64, arm64)
	@./docker-publish-multiplatform.sh

publish-multi-version: ## Опублікувати multi-platform з версією (make publish-multi-version VERSION=v0.5.0)
	@./docker-publish-multiplatform.sh $(VERSION)
