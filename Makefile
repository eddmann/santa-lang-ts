IMAGE = oven/bun:alpine
DOCKER = docker run --rm -v $(PWD):/app -w /app

.PHONY: lang/install
lang/install:
	@$(DOCKER) $(IMAGE) sh -c "cd src/lang && bun install"

.PHONY: lang/test
lang/test:
	@$(DOCKER) $(IMAGE) sh -c "cd src/lang && bun test"

.PHONY: cli/install
cli/install:
	@$(DOCKER) $(IMAGE) sh -c "cd src/cli && bun install"

.PHONY: cli/test
cli/test:
	@$(DOCKER) $(IMAGE) sh -c "cd src/cli && bun test"

.PHONY: cli/build
cli/build:
	@$(DOCKER) -e BUN_RUNTIME_TRANSPILER_CACHE_PATH=/tmp $(IMAGE) sh -c "cd /tmp && cp -r /app/src/cli /tmp/cli && cp -r /app/src/lang /tmp/lang && cd /tmp/cli && bun run package:all && cp -r /tmp/cli/dist /app/src/cli/"

.PHONY: web/install
web/install:
	@$(DOCKER) $(IMAGE) sh -c "cd src/web && bun install"

.PHONY: web/test
web/test:
	@$(DOCKER) $(IMAGE) sh -c "cd src/web && bun run lint"

.PHONY: web/build
web/build:
	@$(DOCKER) $(IMAGE) sh -c "cd src/web && bun run build"

.PHONY: lambda/install
lambda/install:
	@$(DOCKER) $(IMAGE) sh -c "cd src/lambda && bun install"

.PHONY: lambda/build
lambda/build:
	@$(DOCKER) -e BUN_RUNTIME_TRANSPILER_CACHE_PATH=/tmp $(IMAGE) sh -c "cd /tmp && cp -r /app/src/lambda /tmp/lambda && cp -r /app/src/lang /tmp/lang && cd /tmp/lambda && mkdir -p dist && bun build ./src/index.ts --compile --target=bun-linux-x64 --outfile=dist/bootstrap && mkdir -p /app/src/lambda/dist && cp /tmp/lambda/dist/bootstrap /app/src/lambda/dist/bootstrap"
	@$(DOCKER) $(IMAGE) sh -c "apk --no-cache add zip && cd src/lambda && bun run package:layer"

.PHONY: lambda/publish
lambda/publish:
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

.PHONY: shell
shell:
	@$(DOCKER) -it $(IMAGE) sh
