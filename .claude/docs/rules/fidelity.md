# Fidelity Checklist (prototype conversion)

Fidelity to the HTML mockup (see html-prototype.md) is **the bar**. After building a section, walk
this checklist top to bottom against the original before calling it done. Don't trust memory — open
the mockup next to the running component (`npm run dev`, port 3000) and compare.

## Spacing & layout
- [ ] Internal padding matches the original (measure: 16 / 20 / 24px?)
- [ ] Margin / gap between elements equal?
- [ ] Alignment (flex / grid) reproduces the original?
- [ ] Max width / containers respected?

## Typography
- [ ] Font size per element (`text-sm` / `base` / `lg`)?
- [ ] Weight (`font-medium` / `semibold` / `bold`)?
- [ ] Text color via tokens (`text-foreground` / `text-muted-foreground`)?
- [ ] Line-height / spacing?

## Colors & borders
- [ ] Background colors via tokens (`bg-background` / `bg-card` / `bg-primary`) — no raw hex?
- [ ] Border radius (`rounded-lg` / `xl`)?
- [ ] Border color/width (`border-border`)?
- [ ] Shadows (`shadow-sm` / `md`)?

## States (what separates good from great)
- [ ] Hover reproduced?
- [ ] Focus ring on inputs/buttons (`focus-visible:ring-ring/50`)?
- [ ] Disabled state if applicable?
- [ ] Active / selected if applicable?
- [ ] Transitions for smoothness?

## Responsiveness
- [ ] Mobile-first, works from ~320px (responsive.md)?
- [ ] Breakpoints (`md:` / `lg:`) where the mockup implies them?
- [ ] No horizontal scroll on the page body?

## System (respect it, don't reinvent)
- [ ] Reused `@/components/ui` (shadcn) and design tokens instead of building from scratch?
- [ ] Icons from `lucide-react`?
- [ ] Component looks made "by the same hand" as the rest of the code?
- [ ] Both light and dark themes look right (tokens, not hardcoded colors)?
