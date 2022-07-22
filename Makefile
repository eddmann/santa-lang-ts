IMAGE = node:16.16.0-alpine3.15
DOCKER = docker run --rm -v $(PWD):/app -w /app

.PHONY: lang/install
lang/install:
	@$(DOCKER) $(IMAGE) yarn --cwd lang install --immutable

.PHONY: lang/test
lang/test:
	@$(DOCKER) $(IMAGE) yarn --cwd lang test

.PHONY: cli/install
cli/install:
	@$(DOCKER) $(IMAGE) yarn --cwd cli install --immutable

.PHONY: cli/test
cli/test:
	@$(DOCKER) $(IMAGE) yarn --cwd cli test

.PHONY: cli/build
cli/build:
	@$(DOCKER) $(IMAGE) yarn --cwd cli build

.PHONY: shell
shell:
	@$(DOCKER) -it $(IMAGE) sh
