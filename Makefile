IMAGE = node:16.16.0-alpine3.15
DOCKER = docker run --rm -v $(PWD):/app -w /app
LANG_YARN = $(DOCKER) $(IMAGE) yarn --cwd src/lang
CLI_YARN = $(DOCKER) $(IMAGE) yarn --cwd src/cli

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

.PHONY: shell
shell:
	@$(DOCKER) -it $(IMAGE) sh
