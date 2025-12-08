IMAGE = oven/bun:alpine
DOCKER = docker run --rm -v $(PWD):/app -w /app

.DEFAULT_GOAL := help

.PHONY: help
help: ## Display this help message
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z\/_%-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

.PHONY: shell
shell: ## Interactive shell in Docker build environment
	@$(DOCKER) -it $(IMAGE) sh

##@ Lang

.PHONY: lang/install
lang/install: ## Install lang dependencies
	@$(DOCKER) $(IMAGE) sh -c "cd src/lang && bun install"

.PHONY: lang/test
lang/test: lang/install ## Run lang tests
	@$(DOCKER) $(IMAGE) sh -c "cd src/lang && bun test"

##@ CLI

.PHONY: cli/install
cli/install: lang/install ## Install CLI dependencies
	@$(DOCKER) $(IMAGE) sh -c "cd src/cli && bun install"

.PHONY: cli/test
cli/test: cli/install ## Run CLI tests
	@$(DOCKER) $(IMAGE) sh -c "cd src/cli && bun test"

.PHONY: cli/build
cli/build: cli/install ## Build CLI binaries
	@$(DOCKER) -e BUN_RUNTIME_TRANSPILER_CACHE_PATH=/tmp $(IMAGE) sh -c "cd /tmp && cp -r /app/src/cli /tmp/cli && cp -r /app/src/lang /tmp/lang && cd /tmp/lang && bun install && cd /tmp/cli && bun install && bun run package:all && cp -r /tmp/cli/dist /app/src/cli/"

##@ Web

.PHONY: web/install
web/install: lang/install ## Install web dependencies
	@$(DOCKER) $(IMAGE) sh -c "cd src/web && bun install"

.PHONY: web/test
web/test: web/install ## Run web linting
	@$(DOCKER) $(IMAGE) sh -c "cd src/web && bun run lint"

.PHONY: web/build
web/build: web/install ## Build web application
	@$(DOCKER) $(IMAGE) sh -c "cd src/web && bun run build"

##@ Lambda

.PHONY: lambda/install
lambda/install: lang/install ## Install Lambda dependencies
	@$(DOCKER) $(IMAGE) sh -c "cd src/lambda && bun install"

.PHONY: lambda/build
lambda/build: lambda/install ## Build Lambda layer
	@$(DOCKER) -e BUN_RUNTIME_TRANSPILER_CACHE_PATH=/tmp $(IMAGE) sh -c "cd /tmp && cp -r /app/src/lambda /tmp/lambda && cp -r /app/src/lang /tmp/lang && cd /tmp/lang && bun install && cd /tmp/lambda && bun install && mkdir -p dist && bun build ./src/index.ts --compile --target=bun-linux-x64 --outfile=dist/bootstrap && mkdir -p /app/src/lambda/dist && cp /tmp/lambda/dist/bootstrap /app/src/lambda/dist/bootstrap"
	@$(DOCKER) $(IMAGE) sh -c "apk --no-cache add zip && cd src/lambda && bun run package:layer"

.PHONY: lambda/publish
lambda/publish: ## Publish Lambda layer to AWS
	LAYER_VERSION=$$( \
		aws lambda publish-layer-version \
		--region eu-west-1 \
		--layer-name "santa-lang" \
		--zip-file "fileb://src/lambda/dist/layer.zip" \
		--compatible-runtimes provided \
		--license-info MIT \
		--output text \
		--query Version \
	) && \
	aws lambda add-layer-version-permission \
		--region eu-west-1 \
		--layer-name "santa-lang" \
		--version-number "$${LAYER_VERSION}" \
		--action lambda:GetLayerVersion \
		--statement-id public \
		--principal "*"
