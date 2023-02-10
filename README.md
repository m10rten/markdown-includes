# markdown-includes

[![Bundle size](https://img.shields.io/bundlephobia/min/markdown-includes/latest?style=for-the-badge&color=3178c6)](https://bundlephobia.com/package/markdown-includes@latest)&nbsp;
[![Downloads](https://img.shields.io/npm/dt/markdown-includes?style=for-the-badge)](https://www.npmjs.com/package/markdown-includes)&nbsp;
[![License](https://img.shields.io/npm/l/markdown-includes?style=for-the-badge&color=efb103)](https://github.com/m10rten/markdown-includes/blob/main/LICENSE)&nbsp;
[![Version](https://img.shields.io/npm/v/markdown-includes?style=for-the-badge&color=cb3837&logo=npm)](https://www.npmjs.com/package/markdown-includes)&nbsp;
[![GitHub Repo stars](https://img.shields.io/github/stars/m10rten/markdown-includes?color=E9E9E9&logo=Github&style=for-the-badge)](https://www.github.com/m10rten/markdown-includes)&nbsp;
[![GitHub issues](https://img.shields.io/github/issues-raw/m10rten/markdown-includes?label=issues&style=for-the-badge)](https://www.github.com/m10rten/markdown-includes/issues)

Compile multiple Markdown files into 1 using a simple script, use it to create a menu, remove comments, etc.

## Features

- ✅ Easy to use within your new or existing projects.
- ⌚ Compile multiple Markdown files into 1 with the `&|include` tag.
- 🗃️ Create a menu of contents with the `&|menu` tag.
- 🧹 Remove comments from output file with the `&|no_comments` tag.

## Usage

1. Create a markdown file with any name, e.g. `index.md`.
2. Install the compiler globally or locally in your project:

   ```bash
   # npm
   npm install -g markdown-includes

   # or yarn
   yarn global add markdown-includes

   # or pnpm
   pnpm install -g markdown-includes
   ```

   Or install it locally in your project:

   ```bash
   # npm
   npm install markdown-includes
   ```

3. Run the compiler:

   ```bash
   mdi <input file> [options]
   ```

   Or if you installed it locally:

   ```bash
   npx mdi <input file> [options]
   ```

   **Multiple files**
   When you want to compile multiple files, use the `*` as the `<input file>`, like this: `mdi ./*`. <br>
   It will compile all files in the current directory specified: `mdi examples/*` will compile all inside examples. <br>

   > ⚠️ When using just the `*` as the `<input file>`, you must specify the `--folder` option, like this: `mdi * --folder <dir name>`. At this point `*` has no usage. <br>
   > When using the `*`, make sure to use it as: `./*`. <br>
   > ❗The `*` will only work on the build script, not on the watch script.

### Options

- `--debug`: See what is logged to the console.
- `--out <file>`: Specify the output file. If not specified, the output will be written to the console.
- `--version` | `-v`: Show the version number.
- `--help` | `-h`: Show the help.
- `--watch` | `-w`: Watch the input file for changes and recompile when it changes.
- `--menu-depth <number>`: Specify the default document depth of the menu. System default is `3`.
- `--no-comments`: Remove comments from the output file. System default is `false`.
- `--folder <path>`: Specify the folder where the input file is located. System default is the current working directory.

## Examples

### Include file

#### Input

```markdown
# Title

&|include include.md
```

#### Output

```markdown
# Title

This is the included file.
```

### Include menu

Easily create a menu of contents with the `&|menu` tag. The menu will be created based on the headings in the document.

#### Input

```markdown
# Document

&|menu

## 1. Test

### Sub item
```

##### Options

- `&|menu 3`: Specify the depth of the menu in a specific document. Document default is `3`.

#### Output

```markdown
# Document

- [Document](#document)
  - [1. Test](#1-test)
    - [Sub item](#sub-item)

## Test

### Sub item
```

### No comments in output file

No more removing comments, just use this tag and all comments (inline, single or multi-line) will be stripped from the output.

#### Input

```markdown
&|no_comments

## Markdown test

Lorum ipsum

<!-- this is a comment -->
```

#### Output

```markdown
## Markdown test

Lorum ipsum
```

## License

MIT

## Author

[m10rten](https://github.com/m10rten)
