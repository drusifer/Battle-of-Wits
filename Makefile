.DEFAULT_GOAL := help

COUNT ?= 10

ifdef MKF_ACTIVE

# ── Real recipes (invoked by mkf, not directly by the user) ─────────────────

.PHONY: tldr npm-install merge-attributes merge-conversations assemble-all package test test-watch test-coverage \
        uat uat2 uat3 uat4 uat-gui goblet-preview simulate \
        lint lint-fix lint-format lint-format-fix lint-complexity \
        lint-dead-code lint-security lint-structure lint-duplication \
        install_bob

tldr: ## Show TL;DR summaries from all project files (quick orientation for agents)
	@rg --no-heading "TL;DR:" --glob "*.md" -N | sed 's|^\./||' | sort

npm-install: ## Install npm dependencies
	npm install

merge-attributes: ## Merge individual category JSONs into data/attributes.json
	node scripts/mergeAttributes.js

merge-conversations: ## Merge individual conversation JSONs into data/conversations.json
	node scripts/mergeConversations.js

assemble-all: merge-attributes merge-conversations ## Assemble all data files (attributes and conversations)

package: assemble-all ## Assemble all assets and create build/bow.tar
	tar -cf build/bow.tar index.html src/ data/
	@echo "build/bow.tar created"

test: ## Run test suite once
	npm test

test-watch: ## Run tests in watch mode
	npm run test:watch

test-coverage: ## Run tests with coverage report
	npm run test:coverage

uat: ## Run Sprint 1 UAT acceptance checks
	node agents/tools/uat_sprint1.mjs

uat2: ## Run Sprint 2 UAT acceptance checks
	node agents/tools/uat_sprint2.mjs

uat3: ## Run Sprint 3 UAT acceptance checks (UI layer contracts)
	node agents/tools/uat_sprint3.mjs

uat4: ## Run Sprint 4 UAT acceptance checks (UX polish + sound)
	node agents/tools/uat_sprint4.mjs

uat-gui: ## Run headless Playwright GUI tests — validates SPRINT3_Feedback UX contracts (starts/stops dev server)
	PORT=$$(python3 -c "import socket; s=socket.socket(); s.bind(('',0)); p=s.getsockname()[1]; s.close(); print(p)") npx playwright test

goblet-preview: ## Print COUNT goblet description pairs for human eval (default: 10)
	node agents/tools/goblet_preview.mjs $(COUNT)

simulate: ## Run the GameSimulator for deck optimization and metrics (usage: make simulate [COUNT=1000])
	node scripts/simulate.js $(COUNT)

# ── Code Quality ─────────────────────────────────────────────────────────────

lint: ## Run all lint checks (ESLint + format + duplication)
	npm run lint
	npm run format
	npm run duplication

lint-fix: ## Auto-fix ESLint + Prettier issues
	npm run lint:fix
	npm run format:fix

lint-format: ## Check code formatting (Prettier)
	npm run format

lint-format-fix: ## Auto-fix formatting
	npm run format:fix

lint-complexity: ## Check cyclomatic complexity, nesting depth, function length
	npx eslint src/ --rule '{"complexity":["error",10],"max-depth":["error",4],"max-lines-per-function":["error",40],"max-params":["error",4],"max-nested-callbacks":["error",3]}'

lint-dead-code: ## Detect unused vars, unreachable code, unused expressions
	npx eslint src/ --rule '{"no-unused-vars":"error","no-unreachable":"error","no-unused-expressions":"error"}'

lint-security: ## Security audit (eval, unsafe regex, non-literal require paths)
	npx eslint src/ --plugin security --rule '{"security/detect-eval-with-expression":"error","security/detect-unsafe-regex":"error","security/detect-non-literal-regexp":"error","security/detect-object-injection":"warn","security/detect-possible-timing-attacks":"warn"}'

lint-structure: ## Code smell detection (magic numbers, nesting, var, eqeq, etc.)
	npx eslint src/ --rule '{"no-var":"error","prefer-const":"error","eqeqeq":["error","always"],"no-nested-ternary":"error","no-lonely-if":"error","no-else-return":"warn","no-param-reassign":"warn","consistent-return":"warn","no-shadow":"warn"}'

lint-duplication: ## Detect copy-paste duplication (min 8 lines / 50 tokens)
	npm run duplication

install_bob: ## Copy agents into a project and set up skill links (usage: make install TARGET=/path/to/project)
	@[ -n "$(TARGET)" ] || { echo "Usage: make install_bob TARGET=/path/to/project"; exit 1; }
	@[ -d "$(TARGET)" ] || { echo "Error: $(TARGET) does not exist"; exit 1; }
	@echo "Installing BobProtocol into $(TARGET)..."
	@rsync -a \
		--exclude='*.docs/context.md' \
		--exclude='*.docs/current_task.md' \
		--exclude='*.docs/next_steps.md' \
		--exclude='CHAT.md' \
		agents/ $(TARGET)/agents/
	@echo "Initialising agent state files..."
	@for dir in $(TARGET)/agents/*.docs; do \
		cp agents/templates/_template_context.md    $$dir/context.md; \
		cp agents/templates/_template_current_task.md $$dir/current_task.md; \
		cp agents/templates/_template_next_steps.md $$dir/next_steps.md; \
	done
	@cp agents/templates/_template_CHAT.md $(TARGET)/agents/CHAT.md
	@echo "Setting up Claude skill links..."
	@python $(TARGET)/agents/tools/setup_agent_links.py
	@echo ""
	@echo "Done. BobProtocol installed in $(TARGET)"
	@echo "Run 'make tldr' inside $(TARGET) to verify."

else

# ── Interception layer ───────────────────────────────────────────────────────
# All targets except help route through mkf (scripts/mkf).
# mkf captures output to build/build.out, posts status to CHAT.md,
# and prints the last 10 lines on exit.
#
# Verbosity (set V=):
#   make test              silent  — exit code only, full log in build/build.out
#   make test V=-v         stderr to terminal
#   make test V=-vv        stderr + filtered failures to terminal
#   make test V=-vvv       stderr + full stdout to terminal

.PHONY: help chat preview

help: ## Show available make targets
	@echo ""
	@echo "  Build output filter (mkf) is active. All targets route through scripts/mkf."
	@echo "  Full log: build/build.out   Status posted to: agents/CHAT.md"
	@echo ""
	@echo "  Verbosity: append V=-v | V=-vv | V=-vvv to any target"
	@echo "    (none)   silent — exit code only"
	@echo "    -v       stderr to terminal"
	@echo "    -vv      stderr + failures/errors to terminal"
	@echo "    -vvv     stderr + full stdout to terminal"
	@echo ""
	@echo "  Examples:"
	@echo "    make test              # silent, log → build/build.out"
	@echo "    make test V=-vv        # show failures only"
	@echo "    make lint V=-vvv       # full output"
	@echo ""
	@echo "  Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "    \033[36m%-22s\033[0m %s\n", $$1, $$2}'
	@echo ""

chat: ## Post a message to CHAT.md (usage: make chat MSG="<msg>" [PERSONA="<name>"] [CMD="<cmd>"] [TO="<recipient>"])
	@[ -n "$(MSG)" ] || { echo "Usage: make chat MSG=\"<message>\" [PERSONA=\"<name>\"] [CMD=\"<cmd>\"] [TO=\"<recipient>\"]"; exit 1; }
	@python agents/tools/chat.py "$(MSG)" \
		$(if $(PERSONA),--persona "$(PERSONA)") \
		$(if $(CMD),--cmd "$(CMD)") \
		$(if $(TO),--to "$(TO)")

preview: ## Start dev server on 0.0.0.0 with an available port (Ctrl+C to stop)
	@echo "Starting dev server — press Ctrl+C to stop"
	npx vite --host 0.0.0.0

%:
	@./scripts/mkf $(V) $@

endif
