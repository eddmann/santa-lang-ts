IMAGE = node:16.16.0-alpine3.15
DOCKER = docker run --rm -v $(PWD):/app -w /app
LANG_YARN = $(DOCKER) $(IMAGE) yarn --cwd src/lang
CLI_YARN = $(DOCKER) $(IMAGE) yarn --cwd src/cli
WEB_YARN = $(DOCKER) $(IMAGE) yarn --cwd src/web
LAMBDA_YARN = $(DOCKER) $(IMAGE) yarn --cwd src/lambda

.PHONY: lang/install
lang/install:
	@$(LANG_YARN) install --immutable

.PHONY: lang/test
lang/test:
	@$(LANG_YARN) test

.PHONY: cli/install
cli/install:
	@$(CLI_YARN) install --immutable

.PHONY: cli/test
cli/test:
	@$(CLI_YARN) test

.PHONY: cli/build
cli/build:
	@$(CLI_YARN) compile
	@$(CLI_YARN) package:binary

.PHONY: web/install
web/install:
	@$(WEB_YARN) install --immutable

.PHONY: web/test
web/test:
	@$(WEB_YARN) test

.PHONY: web/build
web/build:
	@$(WEB_YARN) build

.PHONY: lambda/install
lambda/install:
	@$(LAMBDA_YARN) install --immutable

.PHONY: lambda/build
lambda/build:
	@$(LAMBDA_YARN) compile
	$(DOCKER) $(IMAGE) sh -c "apk --no-cache add zip && yarn --cwd src/lambda package:layer"

.PHONY: shell
shell:
	@$(DOCKER) -it $(IMAGE) sh
