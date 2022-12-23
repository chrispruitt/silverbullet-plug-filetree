run:
	docker run -it --rm -p 3000:3000 -v $(PWD)/space:/space:Z -v $(PWD):/src:Z zefhemel/silverbullet

plug-watch:
	deno task watch