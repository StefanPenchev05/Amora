# ---------- Root Makefile ----------
SHELL := /bin/bash

# Colors
BLUE := \033[34m
GREEN := \033[32m
YELLOW := \033[33m
RESET := \033[0m

# ---------- Versioning (git describe) ----------
VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
# For now it is only the gh, later it will be switch to hosting platform
REGISTRY ?= ghcr.io/stefanpenchev05
IMAGE ?= $(REGISTRY)/viki:$(VERSION)

.DEFAULT_GOAL := help


.PHONY: help
help:
	@printf "$(BLUE)Usage: make <target>$(RESET)\n"
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


# ----- Backend passthroughs -----


