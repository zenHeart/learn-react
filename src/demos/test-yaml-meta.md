---
minute: 5
title: "Test Document with YAML Metadata"
author: "Developer"
tags: ["react", "markdown", "test"]
description: "A test document to demonstrate YAML frontmatter parsing"
---

# Test Document with Metadata

This is a test document that demonstrates the new YAML frontmatter parsing functionality.

## Features

The metadata parser supports the following fields:

- `minute`: Reading time in minutes (displayed in the header)
- `title`: Document title
- `author`: Document author
- `tags`: Array of tags
- `description`: Document description

## How it Works

The parser extracts YAML frontmatter from the beginning of markdown files and uses the `minute` field to display reading time. If no `minute` field is provided, no reading time is displayed.

## Extensibility

The metadata interface is designed to be extensible. You can add new fields to the YAML frontmatter, and they will be parsed and available in the metadata object.

### Example Usage

```yaml
---
minute: 3
title: "My Document"
author: "John Doe"
tags: ["tutorial", "guide"]
custom_field: "custom value"
---
```

This document should show "5 min read" in the header since we specified `minute: 5` in the frontmatter. 