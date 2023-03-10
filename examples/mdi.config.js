/** @type {import('../src/index').Config} */
module.exports = {
	menuDepth: 4,
	noComments: false,
	extensions: [".md", ".mdx"],
	ignore: ["node_modules", "dist", "build", "public", "docs", "chapters"],
	root: "./",
	output: "./out",
	debug: true,
};
