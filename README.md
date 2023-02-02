# markdown-includes

Compile multiple Markdown files into 1 using a simple script.

## Usage

1. Create a markdown file with `&|>` in it. This is a notation to tell the compiler to include the contents of another file.
2. Install the compiler using `npm install -g markdown-includes`.
3. Run the compiler using `mdi <input file> [options]`.

### Options

- `--debug`: See what is logged to the console.
- `--out <file>`: Specify the output file. If not specified, the output will be written to the console.
- `--version` | `-v`: Show the version number.
- `--help` | `-h`: Show the help.
- `--watch` | `-w`: Watch the input file for changes and recompile when it changes.

## Examples

### Include file

#### Input

```markdown
# Title

&|> include.md
```

#### Output

```markdown
# Title

This is the included file.
```

### Include menu

#### Input

```markdown
# Document

&|menu

## 1. Test

### Sub item
```

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
