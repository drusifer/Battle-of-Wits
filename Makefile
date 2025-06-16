TARGET = bow.html
HTML_TEMPLATE = "Battle Of Wits.html"
CSS_SOURCE = style.css
JS_SOURCES = \
    deck.js \
    autoShuffleDeck.js \
    attributes.js \
    riddles.js \
    goblet.js \
    chat.js \
    characters.js \
    game.js \
    main.js

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(HTML_TEMPLATE) $(CSS_SOURCE) $(JS_SOURCES)
	@echo "Assembling $(TARGET)..."
	# Prepare CSS block
	@echo "<style>" > .tmp_style.css
	@cat $(CSS_SOURCE) >> .tmp_style.css
	@echo "</style>" >> .tmp_style.css

	# Prepare JS block
	@echo "<script type=\"module\">" > .tmp_script.js
	@echo "// Combined JavaScript modules. Order of concatenation:" >> .tmp_script.js
	@for js_file in $(JS_SOURCES); do \
		echo "// --- Start of $$js_file ---" >> .tmp_script.js; \
		cat $$js_file >> .tmp_script.js; \
		echo "\n// --- End of $$js_file ---\n" >> .tmp_script.js; \
	done
	@echo "</script>" >> .tmp_script.js

	# Use awk to replace placeholders in the HTML template
	# This assumes $(HTML_TEMPLATE) contains '<!-- CSS_PLACEHOLDER -->' and '<!-- JS_PLACEHOLDER -->'
	@awk ' \
		BEGIN { css_done=0; js_done=0; } \
		/<!-- CSS_PLACEHOLDER -->/ { \
			if (!css_done) { system("cat .tmp_style.css"); css_done=1; next; } \
		} \
		/<!-- JS_PLACEHOLDER -->/ { \
			if (!js_done) { system("cat .tmp_script.js"); js_done=1; next; } \
		} \
		{ print; } \
	' "$(HTML_TEMPLATE)" > $(TARGET)

	# Clean up temporary files
	@rm -f .tmp_style.css .tmp_script.js

	@echo "$(TARGET) assembled successfully."
	@echo "INFO: This Makefile assumes '$(HTML_TEMPLATE)' contains placeholders:"
	@echo "      '<!-- CSS_PLACEHOLDER -->' (ideally in <head>)"
	@echo "      '<!-- JS_PLACEHOLDER -->' (ideally before </body>)"
	@echo "WARNING: Your JavaScript files appear to use ES6 modules (import/export)."
	@echo "         Simply concatenating them into a single <script type=\"module\"> block like this"
	@echo "         might lead to issues if they use relative path imports (e.g., import X from './module.js')."
	@echo "         The browser will try to resolve these paths relative to the HTML document, not from within the combined script."
	@echo "         For robust ES6 module bundling, consider using a dedicated JavaScript bundler (e.g., Rollup, Webpack, Parcel)."

clean:
	@echo "Cleaning up..."
	@rm -f $(TARGET) .tmp_style.css .tmp_script.js
	@echo "Cleaned up $(TARGET) and temporary files."