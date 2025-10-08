# ---------- Infrastructure Makefile ----------
SHELL := /bin/bash

# Colors
BLUE := \033[34m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
CYAN := \033[36m
RESET := \033[0m

.PHONY: check-versions clean docker-clean system-info

check-versions:
	@printf "$(BLUE)🔍 Development Tool Versions$(RESET)\n"
	@printf "$(CYAN)================================$(RESET)\n"
	@printf "$(YELLOW)System:$(RESET)\n"
	@printf "  OS: $$(uname -s) $$(uname -r)\n"
	@printf "  Shell: $(SHELL)\n"
	@printf "\n$(YELLOW)Core Tools:$(RESET)\n"
	@printf "  Make: " && make --version 2>/dev/null | head -1 || printf "$(RED)not found$(RESET)"
	@printf "\n  Git: " && git --version 2>/dev/null || printf "$(RED)not found$(RESET)"
	@printf "\n\n$(YELLOW)Backend (Go):$(RESET)\n"
	@printf "  Go: " && go version 2>/dev/null || printf "$(RED)not found$(RESET)"
	@printf "\n\n$(YELLOW)Frontend (Node.js):$(RESET)\n"
	@printf "  Node.js: " && node --version 2>/dev/null || printf "$(RED)not found$(RESET)"
	@printf "\n  NPM: " && npm --version 2>/dev/null || printf "$(RED)not found$(RESET)"
	@printf "\n\n$(YELLOW)Container Tools:$(RESET)\n"
	@printf "  Docker: " && docker --version 2>/dev/null || printf "$(RED)not found$(RESET)"
	@printf "  Docker Compose: " && docker compose version 2>/dev/null || printf "$(RED)not found$(RESET)"
	@printf "\n\n$(GREEN)✅ Version check complete!$(RESET)\n"

system-info:
	@printf "$(BLUE)💻 System Information$(RESET)\n"
	@printf "$(CYAN)====================$(RESET)\n"
	@printf "$(YELLOW)Hardware:$(RESET)\n"
	@printf "  Architecture: $$(uname -m)\n"
	@printf "  Processor: $$(uname -p 2>/dev/null || echo 'Unknown')\n"
	@printf "\n$(YELLOW)Memory:$(RESET)\n"
	@if command -v free >/dev/null 2>&1; then \
		free -h | head -2; \
	elif command -v vm_stat >/dev/null 2>&1; then \
		printf "  macOS Memory Info:\n"; \
		vm_stat | head -4; \
	else \
		printf "  Memory info not available\n"; \
	fi
	@printf "\n$(YELLOW)Disk Space:$(RESET)\n"
	@df -h . | head -2
	@printf "\n$(GREEN)✅ System info complete!$(RESET)\n"

clean:
	@printf "$(YELLOW)🧹 Infrastructure cleanup...$(RESET)\n"
	@printf "$(CYAN)Cleaning Docker resources...$(RESET)\n"
	@docker system prune -f 2>/dev/null || printf "$(RED)Docker not available$(RESET)\n"
	@printf "$(GREEN)✅ Infrastructure cleanup complete!$(RESET)\n"

docker-clean:
	@printf "$(YELLOW)🐳 Deep Docker cleanup...$(RESET)\n"
	@printf "$(CYAN)Removing stopped containers...$(RESET)\n"
	@docker container prune -f 2>/dev/null || printf "$(RED)Docker not available$(RESET)\n"
	@printf "$(CYAN)Removing unused images...$(RESET)\n"
	@docker image prune -a -f 2>/dev/null || printf "$(RED)Docker not available$(RESET)\n"
	@printf "$(CYAN)Removing unused volumes...$(RESET)\n"
	@docker volume prune -f 2>/dev/null || printf "$(RED)Docker not available$(RESET)\n"
	@printf "$(CYAN)Removing unused networks...$(RESET)\n"
	@docker network prune -f 2>/dev/null || printf "$(RED)Docker not available$(RESET)\n"
	@printf "$(GREEN)✅ Deep Docker cleanup complete!$(RESET)\n"
