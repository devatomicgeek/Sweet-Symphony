# Sweet Symphony v0.9.8.2 - Mobile font loading fix

Moved Google Fonts CSS import to the top of styles.css so browsers load Lilita One and Inter correctly. The previous late @import declarations were ignored by CSS parsers, causing fallback fonts especially on mobile. Added stylesheet cache-busting to all HTML pages. No Firebase or application logic changes.
