/** @type {import('../src/index').Config} */
module.exports = {
	menuDepth: 4,
	noComments: true,
	extensions: [".md", ".mdx"],
	ignore: ["node_modules", "dist", "build", "public", "docs"],
	root: "./",
	output: "./out",
	debug: true,
};
