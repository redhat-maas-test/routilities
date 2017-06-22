IMAGE_FILE?=image.yaml
COMMIT?=$(shell git rev-parse HEAD | cut -c1-8)
IMAGE_VERSION?=latest
REPO?=$(shell cat $(IMAGE_FILE) | grep "^name:" | cut -d' ' -f2)
DOCKER_BUILD_OPTS?=
ARTIFACT_DIR=${CURDIR}/build/distributions
DOCKER?=docker
TAG?=latest

ifdef TRAVIS_TAG
	TAG=$(TRAVIS_TAG)
endif

all:
	tar -czf console-$(TAG).tar.gz bin lib www package.json

build:
	echo "Running docker build $(REPO)"
	mkdir -p $(CURDIR)/build
	cp -r $(CURDIR)/*.tar.gz $(CURDIR)/build/
	dogen --repo-files-dir $(YUM_REPO_DIR) --scripts $(CURDIR)/scripts --verbose $(IMAGE_FILE) $(CURDIR)/build
	$(DOCKER) build $(DOCKER_BUILD_OPTS) -t $(REPO):$(COMMIT) $(CURDIR)/build

push:
	$(DOCKER) tag $(REPO):$(COMMIT) $(DOCKER_REGISTRY)/$(REPO):$(COMMIT)
	$(DOCKER) push $(DOCKER_REGISTRY)/$(REPO):$(COMMIT)

snapshot:
	$(DOCKER) tag $(REPO):$(COMMIT) $(DOCKER_REGISTRY)/$(REPO):$(IMAGE_VERSION)
	$(DOCKER) push $(DOCKER_REGISTRY)/$(REPO):$(IMAGE_VERSION)


clean:
	rm -rf build console-$(TAG).tar.gz

.PHONY: build push snapshot clean
