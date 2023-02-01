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

## Example

### Include file

```markdown
# Title

&|> include.md
```

### Output

```markdown
# Title

This is the included file.
```

## License

MIT

## Author

[m10rten](https://github.com/m10rten)
