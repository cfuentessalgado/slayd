# Slayd

A simple, YAML-based presentation framework that compiles to beautiful HTML slides.

## Features

- Write presentations in clean, readable YAML
- Multiple slide types (hero, two-column, grid, code, timeline, table, etc.)
- Two built-in themes (dark and light)
- Keyboard navigation (arrow keys)
- Progress bar
- Simple markdown-like formatting
- No runtime dependencies (pure HTML/CSS/JS output)

## Installation

Install globally via npm:

```bash
npm install -g @cfuentessalgado/slayd
```

Or use locally in your project:

```bash
npm install @cfuentessalgado/slayd
npx slayd my-talk.yaml
```

## Quick Start

### 1. Create your presentation

Use the built-in template generator:

```bash
slayd init my-talk.yaml
```

Or create a `my-talk.yaml` file manually:

```yaml
title: "My Presentation"
theme: light  # or omit for dark theme

slides:
  - type: hero
    title: "Hello World"
    subtitle: "My first presentation"
    logo: "👋"
```

### 2. Build it

```bash
slayd my-talk.yaml
```

This creates `my-talk.html` that you can open in any browser!

## Commands

### Initialize a new presentation

```bash
slayd init                    # Creates presentation.yaml
slayd init my-talk.yaml       # Creates my-talk.yaml with template
```

### Build presentations

```bash
slayd build                          # Builds all .yaml files in current directory
slayd build my-talk.yaml             # Builds my-talk.yaml to my-talk.html
slayd build input.yaml output.html   # Builds to custom output filename

# Shorthand (no 'build' keyword needed)
slayd my-talk.yaml                   # Same as: slayd build my-talk.yaml
slayd my-talk.yaml output.html       # Same as: slayd build my-talk.yaml output.html
```

### Get help

```bash
slayd --help
```

## Slide Types

### Hero Slide
Perfect for title slides and big announcements.

```yaml
- type: hero
  title: "Big Title"
  subtitle: "Smaller subtitle text"
  logo: "🚀"  # emoji or icon
  titleSize: "5rem"  # optional, customize title size
```

### Image Slide
Show images with optional title and caption.

```yaml
- type: image
  title: "Our Team"
  image: "img/team.png"
  alt: "Team photo"
  caption: "The amazing team"
```

### Default Slide
General purpose slide with title and content.

```yaml
- type: default
  title: "Main Topic"
  subtitle: "Optional subtitle"
  content:
    - "Paragraph text"
    - type: list
      items:
        - "List item 1"
        - "List item 2"
    - type: card
      title: "Card Title"
      content:
        - "Card content here"
    - type: quote
      text: "A memorable quote"
    - type: code
      code: |
        function example() {
          return true;
        }
```

### Two-Column Slide
Compare two things side-by-side.

```yaml
- type: two-column
  title: "Before vs After"
  left:
    title: "Before"
    content:
      - "Old way content"
  right:
    title: "After"
    content:
      - "New way content"
```

#### Advanced: Multiple Cards in Columns
Stack multiple cards in each column:

```yaml
- type: two-column
  title: "Comparison"
  left:
    cards:
      - title: "First Card"
        content:
          - "Card 1 content"
      - title: "Second Card"
        style: "margin-bottom: 1rem;"
        content:
          - "Card 2 content"
  right:
    cards:
      - title: "Another Card"
        content:
          - "Right column content"
```

### Grid Slide
Show multiple items in a grid (2, 3, or 4 columns).

```yaml
- type: grid
  title: "Features"
  columns: 3  # default is 3
  items:
    - type: feature  # with icon
      icon: "🎯"
      title: "Feature 1"
      content: "Description"
    - type: metric  # for stats
      stat: "99.9%"
      label: "Uptime"
    - type: card  # regular card
      title: "Regular Item"
      content: "Details here"
```

### Code Slide
Display code with syntax.

```yaml
- type: code
  title: "Example Code"
  description: "Optional description"
  code: |
    const x = 42;
    console.log(x);
  notes: "Optional notes about the code"
```

### Timeline Slide
Show chronological progression.

```yaml
- type: timeline
  title: "Our Journey"
  items:
    - period: "Q1 2025"
      title: "Launch"
      description: "Started the project"
      items:
        - "Sub-item 1"
        - "Sub-item 2"
    - period: "Q2 2025"
      title: "Growth"
```

### Table Slide
Display tabular data.

```yaml
- type: table
  title: "Performance"
  headers:
    - "Metric"
    - "Before"
    - "After"
  rows:
    - ["Speed", "Slow", "Fast"]
    - ["Cost", "$100", "$10"]
```

### Flow Slide
Create visual process diagrams with arrows.

```yaml
- type: flow
  title: "Process Overview"
  flows:
    - items:
        - title: "Step 1"
          subtitle: "Start here"
        - type: arrow
          text: "→"  # optional custom arrow
        - title: "Step 2"
          subtitle: "Then this"
        - type: arrow
        - title: "Step 3"
          subtitle: "Finally"
  content:
    - type: callout
      content:
        - "**Important note** about this process"
```

## Formatting

Use simple markdown-like syntax in your text:

- `**bold text**` - makes text bold
- `` `code` `` - inline code
- Newlines become `<br>` tags

Code blocks:
````yaml
content:
  - type: code
    code: |
      Your code here
      Multiple lines work
````

### Content Types

#### Lists
Basic lists:
```yaml
content:
  - type: list
    items:
      - "Item 1"
      - "Item 2"
```

Colored lists (great for pros/cons):
```yaml
content:
  - type: list
    style: red  # or green, blue, yellow, gray
    items:
      - "Problem 1"
      - "Problem 2"
```

#### Cards
```yaml
content:
  - type: card
    title: "Card Title"
    style: "margin-bottom: 1rem;"  # optional custom styles
    content:
      - "Card content"
```

#### Callouts
Highlighted boxes for important notes:
```yaml
content:
  - type: callout
    content:
      - "**Important:** This is a key point"
```

#### Quotes
```yaml
content:
  - type: quote
    text: "A memorable quote"
```

#### Code Blocks
```yaml
content:
  - type: code
    code: |
      function example() {
        return true;
      }
```

## Themes

### Dark Theme (default)
Omit the `theme` property or set it to empty:

```yaml
title: "My Presentation"
# No theme property = dark theme
```

### Light Theme
```yaml
title: "My Presentation"
theme: light
```

### Custom Theme
Create your own CSS file and reference it:

```yaml
title: "My Presentation"
theme: my-custom-theme  # loads my-custom-theme.css
```

## Full Example

See `example.yaml` for a complete presentation showcasing all slide types.

Build it with:
```bash
slayd example.yaml
```

## Tips

1. **Keep it simple** - YAML is readable, don't overcomplicate
2. **Use heroes sparingly** - Start, end, and major sections only
3. **Consistent structure** - Stick to 2-3 slide types per presentation
4. **Test early** - Build and view your slides as you write

## Project Structure

```
slayd/
├── builder.js           # The compiler
├── presentation.css     # Dark theme styles
├── light.css           # Light theme styles
├── example.yaml        # Full example presentation
├── my-talk.yaml        # Your presentation (you create this)
└── my-talk.html        # Generated output (auto-created)
```

## Customization

### Custom CSS
You can override styles in your theme CSS file:

```css
/* my-theme.css */
@import url('presentation.css');

h1 {
  color: #ff0000;  /* Custom color */
}
```

Then use it:
```yaml
theme: my-theme
```

## Converting Existing Presentations

To convert your existing HTML presentations to YAML:

1. Look at the slide structure
2. Identify the slide type (hero, two-column, etc.)
3. Extract the content into YAML format
4. Build and compare

## Roadmap

Potential future features:
- [ ] Speaker notes
- [ ] Slide transitions
- [ ] Export to PDF
- [ ] Live reload during development
- [ ] More themes
- [ ] Image optimization
- [ ] Syntax highlighting for code blocks

## License

MIT - Use freely!
