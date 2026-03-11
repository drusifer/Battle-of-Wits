.DEFAULT_GOAL := help

.PHONY: help tldr install npm-install test test-watch test-coverage uat uat2 uat3 \
        lint lint-fix lint-format lint-format-fix lint-complexity lint-dead-code lint-security lint-structure lint-duplication

help: ## Show available make targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

tldr: ## Show TL;DR summaries from all project files (quick orientation for agents)
	@rg --no-heading "TL;DR:" --glob "*.md" -N | sed 's|^\./||' | sort

npm-install: ## Install npm dependencies
	npm install

merge-attributes: ## Merge individual category JSONs into data/attributes.json
	node scripts/mergeAttributes.js

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

# ── Code Quality ────────────────────────────────────────────────────────────

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

install: ## Copy agents into a project and set up skill links (usage: make install TARGET=/path/to/project)
	@[ -n "$(TARGET)" ] || { echo "Usage: make install TARGET=/path/to/project"; exit 1; }
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
