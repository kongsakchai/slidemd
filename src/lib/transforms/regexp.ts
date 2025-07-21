export const regexp = {
	attributes: /([^\s[=:]]+)[=:](^["'].*?["']$|[^\s]+)/g,
	quote: /^["']|["']$/g,
	class: /\.[^\s]+/g,
	id: /#[^\s]+/g,

	filter: /(blur|brightness|contrast|grayscale|hue-rotate|invert|opacity|saturate|sepia|drop-shadow)(?::\s*(^["'].*?["']$|[^\s]+))?/g,
	objectFit: /cover|contain|none/,
	dimensions: /(w|h):\s*([^\s]+)/g,
	percentage: /(\d+)%/
}
