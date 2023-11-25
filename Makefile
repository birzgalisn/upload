DOCKER_COMPOSE := docker compose --env-file .env

DEV := $(DOCKER_COMPOSE) -f .docker/dev/docker-compose.yaml

BUILD := build --parallel
UP := up
REMOVE := down -v --remove-orphans

.PHONY: build-dev
build-dev:
	$(DEV) $(BUILD)

.PHONY: start-dev
start-dev:
	$(DEV) $(UP)

.PHONY: remove-dev
remove-dev:
	$(DEV) $(REMOVE)
