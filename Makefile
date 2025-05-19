run:
	cd back && go run .

push:
	@if [ -z "$(m)" ]; then \
		echo "⚠️  Merci de spécifier un message de commit avec 'make push m=\"Ton message\"'"; \
		exit 1; \
	fi
	git add .
	git commit -m "$(m)"
	git push

compose:
	docker compose up -d
build:
	docker compose build
down :
	docker compose down