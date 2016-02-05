sb4.fma: clean *.html js/*.js js/lib/*.js js/foundation/*.js css/*.css icon.png assets/* package.json
	zip sb4.fma *.html js/*.js js/lib/*.js js/foundation/*.js css/*.css icon.png assets/* package.json

.PHONY: clean

clean:
	rm -rf sb4.fma
