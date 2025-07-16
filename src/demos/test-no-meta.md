# Document Without Metadata

This is a test document without any YAML frontmatter.

## No Reading Time

Since this document doesn't have a `minute` field in YAML frontmatter, no reading time should be displayed in the header.

## Purpose

This demonstrates the conditional rendering of reading time based on the presence of metadata.

The parser will still work with this document, but since there's no `minute` field, the reading time won't be shown. 