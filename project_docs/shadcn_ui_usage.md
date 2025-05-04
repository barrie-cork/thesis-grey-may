# Shadcn UI Usage Guide for Thesis Grey

This document provides guidance on using Shadcn UI components within the Thesis Grey application.

## Overview

Thesis Grey utilizes Shadcn UI, a component library built on Radix UI primitives and styled with Tailwind CSS. It provides accessible, customizable components that are directly installed into the codebase for easy customization.

Key advantages:
- Accessibility out of the box
- Consistent design language
- Customizable components
- Type-safe with TypeScript
- Themeable via CSS variables

## Component Structure

Shadcn UI components in Thesis Grey are located in:

```
src/client/shared/
├── components/
│   ├── ui/                # Shadcn UI components
│   │   ├── button.tsx     # Button component
│   │   ├── card.tsx       # Card component
│   │   ├── input.tsx      # Input component
│   │   └── ...            # Other components
└── lib/
    └── utils.ts           # Utility functions (includes cn helper)
```

## Basic Usage

### Importing Components

Import components from their respective files:

```tsx
import { Button } from '../../shared/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '../../shared/components/ui/card';
import { Input } from '../../shared/components/ui/input';
```

### Example Usage

Here's how to use the components in a feature component:

```tsx
import React, { useState } from 'react';
import { Button } from '../../shared/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '../../shared/components/ui/card';
import { Input } from '../../shared/components/ui/input';

export function SearchForm({ onSubmit }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(query);
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Search Grey Literature</h3>
        <p className="text-sm text-muted-foreground">Enter your search query</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Input
            placeholder="Enter search query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mb-4"
          />
          <Button type="submit">Search</Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

## Component Variants

Many Shadcn UI components come with variants to support different use cases. These are implemented using the class-variance-authority library.

### Button Variants

```tsx
// Different variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Different sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

### Card Component Parts

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
  <CardFooter>
    {/* Card footer */}
  </CardFooter>
</Card>
```

## Available Components

The following Shadcn UI components are available in Thesis Grey:

- **Button**: Interactive button element with various styles and states
- **Card**: Container for related content and actions
- **Input**: Text input field
- More components will be added as needed

## Theme Customization

Shadcn UI uses CSS variables for theming, defined in `src/client/global.css`. These variables can be customized to match your project's design system.

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ...more variables... */
}
```

## Adding New Components

To add more Shadcn UI components to the project, follow these steps:

1. Create a new file in `src/client/shared/components/ui/`
2. Copy the component code from the [Shadcn UI website](https://ui.shadcn.com/docs/components)
3. Ensure proper imports for dependencies
4. Update the component to use the correct import paths for utilities

## Best Practices

- Use Shadcn UI components instead of custom components when possible
- Follow the component API and props pattern for consistency
- Use the `cn()` utility for merging Tailwind classes
- Don't modify the core component files - extend them by wrapping if needed
- Keep feature-specific styling separate from the base components

## Accessibility

Shadcn UI components are built on Radix UI primitives, which provide robust accessibility features. However, it's still important to:

- Use appropriate ARIA attributes when necessary
- Ensure proper keyboard navigation
- Maintain sufficient color contrast
- Test with screen readers

## Examples in Thesis Grey

For real-world usage examples, refer to:

- `src/client/shared/components/ShadcnExample.tsx`: Basic component usage example
- `src/client/auth/pages/LoginPage.tsx`: Authentication forms
- `src/client/searchStrategy/components/SessionList.tsx`: Search session cards 