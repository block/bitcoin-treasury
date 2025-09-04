# Git revisions for external dependencies
BOOTLOADER_HINTS_REV ?= 5648cf0a5a2574c2870151cd178ff3ae4b141824
STWO_REV ?= bbe3e469bc636b89c37cb385854447bd46277b3b
CAIRO_EXECUTE_REV ?= 7fbbd0112b5a926403c17fa95ad831c1715fd1b1

install-bootloader-hints:
	cargo install \
		--git ssh://git@github.com/starkware-libs/bootloader-hints.git \
		--rev $(BOOTLOADER_HINTS_REV) \
		cairo-program-runner

install-stwo:
	RUSTFLAGS="-C target-cpu=native -C opt-level=3" \
		cargo install --force \
		--git https://github.com/starkware-libs/stwo-cairo \
		--rev $(STWO_REV) \
		adapted_stwo

install-cairo-execute:
	cargo install --git https://github.com/m-kus/cairo \
		--rev $(CAIRO_EXECUTE_REV) cairo-execute

install-scarb-eject:
	cargo install --git \
		https://github.com/software-mansion-labs/scarb-eject

install-convert-proof-format:
	RUSTFLAGS="-C target-cpu=native -C opt-level=3" \
		cargo install --force \
		--git https://github.com/starkware-libs/stwo-cairo \
		dev-utils

install-corelib:
	mkdir -p vendor
	rm -rf vendor/cairo
	git clone --single-branch --branch m-kus/system-builtin \
		https://github.com/m-kus/cairo vendor/cairo
	(cd vendor/cairo && git checkout $(CAIRO_EXECUTE_REV))
	ln -s "$(CURDIR)/vendor/cairo/corelib" corelib

install: install-bootloader-hints install-stwo install-cairo-execute \
	install-convert-proof-format install-scarb-eject install-corelib
