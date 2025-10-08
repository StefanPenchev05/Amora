# ---------- Root Makefile ----------
SHELL := /bin/bash

# Colors
BLUE := \033[34m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
CYAN := \033[36m
RESET := \033[0m

# Directories
BACKEND_DIR := backend
FRONTEND_DIR := frontend
INFRA_DIR := infra

# ---------- Versioning (git describe) ----------
VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
# For now it is only the gh, later it will be switch to hosting platform
REGISTRY ?= ghcr.io/stefanpenchev05
IMAGE ?= $(REGISTRY)/amora:$(VERSION)

.DEFAULT_GOAL := help


.PHONY: help setup clean
help:
	@printf "$(BLUE)Usage: make <target>$(RESET)\n"
	@printf "\n"
	@printf "$(YELLOW)Setup:$(RESET)\n"
	@printf "  $(GREEN)make be/install$(RESET)     - install Go dependencies\n"
	@printf "  $(GREEN)make fe/install$(RESET)     - install Node.js dependencies\n"
	@printf "\n"
	@printf "$(YELLOW)Dev:$(RESET)\n"
	@printf "  $(GREEN)make be/run$(RESET)         - run backend locally\n"
	@printf "  $(GREEN)make fe/dev$(RESET)         - run frontend dev server\n"
	@printf "\n"
	@printf "$(YELLOW)Build:$(RESET)\n"
	@printf "  $(GREEN)make be/build$(RESET)       - build Go binary\n"
	@printf "  $(GREEN)make fe/build$(RESET)       - build frontend static files\n"
	@printf "\n"
	@printf "$(YELLOW)Tests & Quality:$(RESET)\n"
	@printf "  $(GREEN)make be/test$(RESET)        - run Go tests\n"
	@printf "  $(GREEN)make be/fmt$(RESET)         - format Go\n"
	@printf "  $(GREEN)make fe/lint$(RESET)        - lint frontend\n"
	@printf "\n"
	@printf "$(YELLOW)Docker:$(RESET)\n"
	@printf "  $(GREEN)make dk/build$(RESET)       - build multi-service images\n"
	@printf "  $(GREEN)make dk/up$(RESET)          - docker compose up -d\n"
	@printf "  $(GREEN)make dk/down$(RESET)        - docker compose down\n"
	@printf "  $(GREEN)make dk/logs$(RESET)        - tail compose logs\n"
	@printf "\n"
	@printf "$(YELLOW)Meta:$(RESET)\n"
	@printf "  $(GREEN)make clean$(RESET)          - clean build artifacts\n"
	@printf "  $(GREEN)make check-versions$(RESET) - display tool versions\n"
	@printf "  $(GREEN)make system-info$(RESET)    - display system information\n"


# ----- Root passthroughs -----
setup:
	$(MAKE) -C backend install
	$(MAKE) -C frontend install

clean:
	@printf "$(YELLOW)🧹 Cleaning all build artifacts...$(RESET)\n"
	$(MAKE) -C $(BACKEND_DIR) clean
	$(MAKE) -C $(FRONTEND_DIR) clean
	$(MAKE) -C $(INFRA_DIR) clean
	@printf "$(GREEN)✅ All artifacts cleaned!$(RESET)\n"

# ----- Backend passthroughs -----
.PHONY: be/install be/build be/run be/test be/fmt be/clean

be/install:
	$(MAKE) -C $(BACKEND_DIR) install

be/build:
	$(MAKE) -C $(BACKEND_DIR) build

be/run:
	$(MAKE) -C $(BACKEND_DIR) run

be/test:
	$(MAKE) -C $(BACKEND_DIR) test

be/fmt:
	$(MAKE) -C $(BACKEND_DIR) fmt

be/clean:
	$(MAKE) -C $(BACKEND_DIR) clean

# ----- Frontend passthroughs -----
.PHONY: fe/install fe/dev fe/build fe/lint fe/preview fe/clean

fe/install:
	$(MAKE) -C $(FRONTEND_DIR) install

fe/dev:
	$(MAKE) -C $(FRONTEND_DIR) dev

fe/build:
	$(MAKE) -C $(FRONTEND_DIR) build

fe/lint:
	$(MAKE) -C $(FRONTEND_DIR) lint

fe/preview:
	$(MAKE) -C $(FRONTEND_DIR) preview

fe/clean:
	$(MAKE) -C $(FRONTEND_DIR) clean

# ----- Infrastructure passthroughs -----
.PHONY: check-versions system-info docker-clean

check-versions:
	$(MAKE) -C $(INFRA_DIR) check-versions

system-info:
	$(MAKE) -C $(INFRA_DIR) system-info

docker-clean:
	$(MAKE) -C $(INFRA_DIR) docker-clean