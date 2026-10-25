# UI Guide: Universal Principles for Visual Composition, Components and Motion

**Edition:** Universal English edition, 8 September 2026. Domain-neutral guidance for any digital product: web, mobile, desktop or internal tools. Evidence coverage and sources are recorded in sections 26 and 27.

**Companion:** [UX.md](UX.md) is the primary experience guide (behavior, feedback, states, trust, accessibility, speed). This guide covers the visible expression of that experience; use both together.

## Contents

- [1. The role of UI and its relationship with UX.md](#1-the-role-of-ui-and-its-relationship-with-uxmd)
- [2. Visual hierarchy and original identity](#2-visual-hierarchy-and-original-identity)
- [3. Grid, alignment, spacing and density](#3-grid-alignment-spacing-and-density)
- [4. Typography and reading comfort](#4-typography-and-reading-comfort)
- [5. Color, contrast, surfaces and themes](#5-color-contrast-surfaces-and-themes)
- [6. Numbers, currency, units and locale](#6-numbers-currency-units-and-locale)
- [7. Imagery, media and art direction](#7-imagery-media-and-art-direction)
- [8. Cards, list items and collections](#8-cards-list-items-and-collections)
- [9. Detail views, galleries and option selection](#9-detail-views-galleries-and-option-selection)
- [10. Ratings, social proof, promotional and third-party content](#10-ratings-social-proof-promotional-and-third-party-content)
- [11. Navigation, search and listings](#11-navigation-search-and-listings)
- [12. Filters, sorting and comparison](#12-filters-sorting-and-comparison)
- [13. Summaries, multi-step flows and irreversible actions](#13-summaries-multi-step-flows-and-irreversible-actions)
- [14. Responsive composition and mobile robustness](#14-responsive-composition-and-mobile-robustness)
- [15. Overlays, tabs and accordions](#15-overlays-tabs-and-accordions)
- [16. Component states and visible feedback](#16-component-states-and-visible-feedback)
- [17. Iconography, motion and interaction polish](#17-iconography-motion-and-interaction-polish)
- [18. Image, font and layout performance](#18-image-font-and-layout-performance)
- [19. Semantic tokens and component contracts](#19-semantic-tokens-and-component-contracts)
- [20. Surface-level visual reference by screen type](#20-surface-level-visual-reference-by-screen-type)
- [21. Standards and adjustable starting points](#21-standards-and-adjustable-starting-points)
- [22. Visual review checklist](#22-visual-review-checklist)
- [23. From reference to original interface](#23-from-reference-to-original-interface)
- [24. Design libraries and a coherent original direction](#24-design-libraries-and-a-coherent-original-direction)
- [25. Component sourcing, library evaluation, implementation craft and browser review](#25-component-sourcing-library-evaluation-implementation-craft-and-browser-review)
- [26. Evidence coverage and remaining choices](#26-evidence-coverage-and-remaining-choices)
- [27. Sources](#27-sources)

## About this guide

This guide provides researched visual guidance for digital interfaces. It addresses how information receives visual weight, how components are composed, and how imagery, typography, color, spacing, and visible states work together across screens and viewports. It is intended for designers, engineers, design-system authors, reviewers, and others who make or evaluate interface decisions. It consolidates research and practical guidance, but it does not implement an interface, decide a final identity, or establish capabilities that a product does not actually provide.

Read this guide with `UX.md`. `UX.md` is the primary reference for behavior and experience: tasks, choices, discovery, decision support, feedback, recovery, trust, accessibility, resilience, and evaluation. `UI.md` addresses the visible composition and expression of those requirements. A visually clear state cannot repair incorrect behavior, and sound behavior does not remove the need to communicate state visibly.

The guidance uses four evidence labels:

- **Established standard:** a normative accessibility or platform requirement, interpreted within the scope of the cited standard.
- **Academic finding:** a result from a study, with its population, method, context, and limitations preserved. A finding should not be generalized beyond what the study supports.
- **Practitioner or tool material:** guidance from design practitioners, design systems, or implementation resources. It offers patterns, tradeoffs, and useful starting points, not universal law.
- **Hypothesis:** a proposition to test with representative content, users, devices, and rendered states. It is not a measured fact or a fixed final value.

When sources appear to conflict, do not assume that one source's "always" automatically outweighs another source's "never." Task structure, truthful content, accessibility, content fit, platform conventions, and the chosen identity jointly determine the visual decision. A prohibition on a particular font, a required gradient, fixed promotional geometry, a universal ban on cards, or animation on every element should not become a default rule merely because it appears in a source recipe. Treat such recipes as options subordinate to the product's tasks and constraints.

Use the relevant topic together with its adjacent guidance on states and responsive behavior. Judge the result with rendered, representative content rather than isolated token values or a static composition. The purpose is to apply shared foundations as one coherent interface, not to fit one effect from every reference onto the same screen. Source archives may support deeper investigation, but reading an entire archive is not a prerequisite for using this consolidated guide.

The central takeaway is **clear priority, useful information, disciplined consistency, and thoughtful expression**. Hierarchy must communicate intended importance. Attributes that users compare must retain consistent meaning and placement. Media and fonts should not destabilize the layout while loading. These concerns should be designed together, because scattered decorative improvements do not create a coherent direction. [[1]](https://www.nngroup.com/articles/visual-hierarchy-ux-definition) [[2]](https://baymard.com/blog/list-item-design-ecommerce) [[3]](https://web.dev/articles/optimize-cls)

Familiarity and originality are not opponents. Recognizable structure can preserve learned expectations, while typography, art direction, section rhythm, shape language, and selected editorial moments establish identity. Controlled screenshot research connects perceived visual complexity and prototypicality with first impressions. Its practical implication is to keep composition understandable, not to remove useful content artificially or imitate another interface. [[4]](https://static.googleusercontent.com/media/research.google.com/en/us/pubs/archive/38315.pdf)

Polish is measured across states and viewports, not in one static screenshot. The same component must remain coherent with a long title, missing media, a selected option, keyboard focus, loading, a failed save, text resizing, and a compact viewport. Readable states and resilience are part of visual quality. WCAG guidance on preserving content and function, contrast, focus, and input alternatives reinforces this broader definition of quality. [[5]](https://www.w3.org/TR/WCAG22/)

## 1. The role of UI and its relationship with UX.md

`UX.md` defines what people need to accomplish, what choices they face, how the interface responds, and how they recover. `UI.md` defines how that meaning is made visible. If a save action must persist, that is an experience requirement. The icon, label, selected treatment, focus indicator, and placement of confirmation are its interface expression. Neither layer can compensate for a failure in the other.

Start with the primary task on a surface, then decide information order and component states, and only then apply expressive styling. Visual design is not screen-by-screen decoration. On a detail surface, an exact selected option and its current key value may deserve more emphasis than an expressive slogan. On an editorial surface, imagery may be the larger anchor. Different tasks can require different emphasis while still using the same palette and component system.

Use the two guides in this order:

1. Establish the task, context, decision, and complete set of states with `UX.md` section 1.
2. Use `UX.md` sections 3 and 4 to define discovery and decision-support requirements before composing navigation, search, collections, filters, comparisons, or detail information.
3. Use `UX.md` sections 6 and 7 to determine what must communicate confidence, feedback, errors, form status, and reversibility.
4. Use `UX.md` sections 9 and 13 to keep persuasion and capability claims honest. Visual finish must never imply a transaction, identity, result, or system state that does not exist.
5. Use `UX.md` sections 10 and 11 for accessibility, mobile usability, speed, stability, and resilience requirements, then express them through the visual rules in this guide.
6. Evaluate behavior with `UX.md` section 14 and visual execution with `UI.md` section 22.

Keep three levels of guidance distinct. **Accessibility requirements** are requirements within the context of the cited standard. **Research and design-system guidance** explains useful patterns and tradeoffs. **Illustrative starting points** provide a consistent basis for exploration, but do not establish final dimensions, columns, typefaces, colors, or motion timings. Shared numerical references appear in `UI.md` section 21.

An interface must describe its actual boundaries. Available browsing, comparison, editing, saving, removal, undo, and local feedback can be polished, but styling must not imply unavailable payment, account, submission, fulfillment, or completion capabilities. A read-only or simulated flow must be visibly identified as such rather than looking like an unfinished real commitment flow. Exploratory content quantities, category structures, comparison limits, and persistence assumptions remain hypotheses until they are tested and verified.

Sample copy and placeholder content do not decide the final language or localization policy. Likewise, neutral surfaces, restrained accents, editorial imagery, compact collections, or any other visual direction remain options until an identity is chosen. This guide does not by itself establish a final palette, type family, theme count, or finished design-system artifact.

For future interface work, study the relevant component or topic together with its states, responsive constraints, and performance implications. Resolve decisions against authentic content and the intended behavior. Do not let visual treatment exaggerate or conceal behavior: an unavailable action must not appear active, an unavailable fact must not become decorative fine print, and an illustrative state must not suggest real completion. Changes to themes, tools, data, or capabilities require their own decisions and validation and cannot be inferred from design guidance.

## 2. Visual hierarchy and original identity

### Define the attention contract

Visual hierarchy is the organization of elements so that the eye encounters them in their intended order of importance. It is not merely a combination of large headings and bright controls. At first inspection, each viewport should answer three questions:

1. What is the current context?
2. What is the primary content or decision?
3. Where is the next meaningful action?

Size, contrast, color, whitespace, and grouping jointly establish that order. [[1]](https://www.nngroup.com/articles/visual-hierarchy-ux-definition) If every signal operates at maximum intensity, the result is competition rather than hierarchy. Treat scale, saturation, contrast, and whitespace as a shared salience budget. Give the primary subject a strong signal, supporting content a calmer signal, metadata a quiet but readable signal, and ambient decoration no more prominence than its meaning warrants. Color must not carry meaning by itself. [[1]](https://www.nngroup.com/articles/visual-hierarchy-ux-definition)

Define salience tiers before styling:

| Tier | Role |
|---|---|
| A | The primary context, content, or decision, usually one main region in a viewport |
| B | Supporting discovery modules and primary actions |
| C | Metadata, helper labels, and tertiary links |
| Ambient | Decorative color or illustration that must not compete with semantic content |

A viewport should generally have one primary visual region. Secondary modules need clear headings, but should not copy the primary region's scale, saturation, and spacing. Metadata may be quieter, yet it must retain readable contrast and an understandable label. The order can change with the task, but multiple Tier A regions should not compete within the same viewport. [[1]](https://www.nngroup.com/articles/visual-hierarchy-ux-definition)

Do not prescribe a fixed F-pattern or Z-pattern as a universal layout rule. Mixed modules and responsive reflow produce different scanning paths. Stable anchors are more dependable: align section headings to a consistent axis, place related actions predictably, and keep associated content nearby. The gap from a heading to its content should be smaller than the gap to the adjacent section. [[1]](https://www.nngroup.com/articles/visual-hierarchy-ux-definition)

Review hierarchy without relying on finished copy or color. In a blur or squint test, the first 2 to 3 visual masses should appear in the intended order. In grayscale, hierarchy should remain legible without hue. When copy is removed and only the skeleton remains, the structure should still distinguish the primary region, supporting groups, and decision summary.

### Group by relationship, not by decoration

Use proximity first to bind related elements. Internal gaps among an image, title, key value, and supporting facts should be smaller than gaps between separate cards or list items. A section heading should sit nearer to its own content than to the preceding section. Add a boundary when it makes a shared context or function clearer. Items enclosed within one boundary tend to be perceived as a related group. [[6]](https://www.nngroup.com/articles/common-region/)

Common region is a strong grouping signal, not permission to put everything in a white card with a border and shadow. Nested cards fragment a page into small competing boxes and make each box demand importance. Test grouping mechanisms in this order:

1. Spacing
2. Alignment
3. A subtle surface difference
4. A border when a stronger boundary is necessary
5. A shadow when actual depth or overlap must be communicated

A broad section surface can group several items without giving every item another heavy outline. Containers are most useful when elements share functionality or context. Normal content flow usually needs whitespace rather than another shell. Use an outline review to identify redundant nested rectangles.

Whitespace acts as visual punctuation, not as a page-wide "airy" setting. A comparison-heavy region may be compact, while an editorial pause may be spacious. Judge density by how well useful information supports comparison and action, not by blank pixel count or the number of cards visible.

### Balance images and text

Every large image needs one clear function: identify an entity, establish a category or subject, or communicate campaign context. A busy collage combined with long copy, multiple badges, and two equally prominent actions weakens both image and text. Preserve natural negative space in the crop for overlaid text. Pair a visual subject with a readable label, because imagery does not replace an accessible name.

Graphics built around loud generic claims can be interpreted as advertising and ignored. Baymard testing found that graphics showing specific items, categories, or seasonal campaigns were more often understood as legitimate content than generic discount or competition graphics, although there were exceptions. [[7]](https://baymard.com/blog/avoid-these-ecommerce-graphics) The source describes a 19-site study and a 50-site benchmark. [[7]](https://baymard.com/blog/avoid-these-ecommerce-graphics) This is established practitioner research, not a normative standard.

Integrate promotional or editorial graphics into the interface's typography, surface, and spacing grammar. Avoid making them isolated posters through a thick box, unrelated type and color, all-capital bursts, or other styling foreign to the surrounding product. Promotional content must still be distinguishable through accurate labels and copy; integration should not hide its nature. A side rail should not automatically be treated as a secondary advertising area, since banner-like placement may be ignored. [[7]](https://baymard.com/blog/avoid-these-ecommerce-graphics)

Frame media according to the subject. Different forms, proportions, and evidence needs should not be forced into one crop logic. Use a text overlay only after verifying composited contrast across likely crops and themes. Otherwise, place text on a stable surface. Decorative illustration should support tone and context rather than compete with the media that provides evidence.

### Preserve familiarity while building identity

Original identity does not require breaking familiar interaction structure. Search, wayfinding, card anatomy, key-value grouping, and section rails can remain recognizable. Distinction can come from art direction, crop policy, shape language, typographic voice, module rhythm, and selective asymmetry. Copying another product's palette, icon silhouette, banner geometry, or dense strip signature is imitation rather than originality.

Controlled studies by Tuch and colleagues found stronger aesthetic ratings for company-site screenshots with lower perceived visual complexity and higher prototypicality. [[4]](https://static.googleusercontent.com/media/research.google.com/en/us/pubs/archive/38315.pdf) Study 1 had 59 participants and Study 2 had 82 participants, and both factors affected judgments after brief exposure. [[4]](https://static.googleusercontent.com/media/research.google.com/en/us/pubs/archive/38315.pdf) These academic findings do not prove outcomes for a particular product category, culture, audience, task, or business result. The stimuli were passive screenshots of company websites, the sample was relatively young, cultural effects were not investigated, and the authors noted that results for other website types remained uncertain. [[4]](https://static.googleusercontent.com/media/research.google.com/en/us/pubs/archive/38315.pdf)

The safe practical inference is that recognizable structure and controlled complexity are useful first-impression targets. It is not an instruction to produce a generic template or reduce the amount of useful content artificially. The target lies between total conformity and novelty in every module: a familiar skeleton with a limited number of authored moments.

Authored identity should be repeatable. An expressive block may break the outer rail, while its readable inner content returns to the core alignment. Distinct media framing can coexist with consistent semantic roles for labels and actions. If the logo and palette are removed, the rhythm should still feel intentional without requiring users to learn a new code for every entity, category, or action.

### Budget novelty and visual tension

Anti-generic craft does not require turning every surface into an experimental showcase. Operational surfaces that support scanning, comparing, editing, and managing saved information should prioritize stable placement and familiar controls. Editorial moments may be more expressive. Budget novelty within the task, never in place of the task.

Choose one strong authored move in a viewport, such as a distinctive crop, asymmetric span, memorable type contrast, or repeated edge motif, then keep surrounding elements calmer. If every card, badge, heading, and action asks to be the signature, no signature remains. [[38]](https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/SKILL.src.md) [[39]](https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/reference/bolder.md)

Visual tension can dramatize priority through media that departs from the grid, a scale jump, a quiet pause after dense content, or controlled imbalance. It fails when the relationship between title and key value breaks, an action is cropped, visual reading order conflicts with semantic order, or comparison axes shift. Stabilize the task path first, then add tension in a selected region. [[40]](https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/reference/layout.md) [[39]](https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/reference/bolder.md)

Do not accumulate borrowed defaults in the name of originality. Floating sparkles, an uppercase eyebrow above every section, random gradient shapes, repeated three-card grids, and invented technical labels can resemble a category-neutral kit. Extract rhythm, density, crop logic, accent discipline, and system behavior from references rather than copying an exact composition. Translate those qualities through authentic content and an original identity. Apply a motif with the same logic across several touchpoints, but do not dress every module in the same costume. [[41]](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/brandkit/SKILL.md) [[42]](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/taste-skill/SKILL.md)

### Treat bold and quiet as relational qualities

To create boldness, apply the system's strongest existing treatment with conviction in one place, then quiet nearby type, color, and decoration. Quiet does not mean uniformly gray or tiny. Decision-critical facts must remain crisp.

Hard-lined, flat, and softly layered visual languages are all valid. Do not combine their absolute prescriptions as a checklist. Source material can conflict directly about corner radius and 1 px borders. Resolve that conflict by choosing a material language appropriate to the task and identity, then applying shape, line, and depth roles consistently. [[43]](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/brutalist-skill/SKILL.md) [[44]](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/minimalist-skill/SKILL.md) [[45]](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/soft-skill/SKILL.md)

Visual polish never licenses deceptive implication. A save, edit, remove, or undo interaction can look refined, but no treatment should imply an unavailable payment, completed submission, verified identity, address collection, or handling of personal information. Fictional or illustrative claims need visible labels. A premium finish does not justify invented proof, false urgency, or completion theater. See `UX.md` sections 9 and 13.

## 3. Grid, alignment, spacing and density

### Use shared rails and content-specific grids

A grid is not a mandate to fill a page with equal boxes. Its purpose is to keep related edges and proportions coherent. Carbon describes its grid as a shared geometric foundation for type, columns, boxes, icons, and illustration. [[8]](https://carbondesignsystem.com/elements/2x-grid/overview) The transferable principle is shared alignment. Carbon's exact column and breakpoint implementation is a convention within that design system, not proof of a universal interface requirement.

Keep outer content rails stable. Inner header content, section headings, the first item in a collection, result counts, and detail summaries should not begin on arbitrary horizontal axes. A horizontal rail should align with the outer container, and any overflow cue should be purposeful. A full-bleed image or color band can be a controlled exception, but readable content inside it should return to the core rail. This lets an expressive interruption remain part of the same interface family.

Use several related axes where the content requires them:

- **Outer content rail:** Major page sections share stable left and right boundaries.
- **Nested rail:** A horizontal collection aligns with the outer rail and communicates continuation or overflow intentionally.
- **Text axis:** A heading, supporting copy, and the first content item have a connected visual start.
- **Image axis:** Subjects within a comparable module share an optical center or baseline even when source proportions vary.
- **Key-value axis:** Comparable cards place important numeric or categorical facts in stable vertical zones.
- **Controlled exception:** A signature region may break the rail, while its readable inner content returns to the core alignment.

Local grids should follow content type. A set of navigational tiles may need equal label zones, comparable cards may need stable value zones, and an editorial block may use an asymmetric split. Shared outer rails provide consistency while local spans fit the content. Consistency should not become monotony: preserve the grid, but vary span, spacing, or media treatment deliberately so a long page does not become an endless feed.

Exact columns, gutters, and spacing values are adjustable starting points. The primary visual rules are relational: related gaps are smaller, section gaps are larger, the outer rail is stable, and responsive visual order remains truthful to semantic and interaction order.

### Start with an illustrative grid, then tune it

The following values are practitioner starting points, not universally validated thresholds:

| Property | Illustrative starting point |
|---|---|
| Base spacing rhythm | 4 px |
| Common gaps | 8 / 12 / 16 / 24 / 32 / 48 px |
| Compact card inner spacing | 12 to 16 px |
| Related module separation | 24 to 32 px |
| Major section separation | 40 to 64 px |
| Wide desktop working grid | 12 columns |
| Medium working grid | 8 columns |
| Compact working grid | 4 columns |

Tune these values against real text length, media crops, controls, density needs, and target viewports. Existing system tokens take precedence. The numbers provide a common implementation vocabulary, not final approval. 

### Align optically after aligning mathematically

Text, images, and icons can share an exact coordinate and still appear misaligned. Start from a common baseline or grid, inspect the rendered result, then apply restrained optical correction at component or asset level. Do not create arbitrary per-instance nudges.

In comparable cards, give the title start, rating or fact region, current key value, and supporting information stable vertical zones. Control variable title length enough to preserve scanning, while keeping the complete title available in an appropriate detail context. Ellipsis is not a content strategy. Test wrapping with long words, model identifiers, units, mixed scripts when localization requires them, and lengthy category or record names.

A stable image frame does not guarantee stable apparent subject scale. Transparent image padding, pale backgrounds, silhouette, perspective, and crop all affect visual weight. Review comparable silhouettes together and tune crop offsets after the frame is fixed. Do not let a small subject disappear into an empty frame or crop away an identifying cue from a large subject. Alignment correction should improve identification and comparison, not falsely imply that differently sized objects have the same physical scale.

Play triangles, chevrons, asymmetric action icons, circular glyphs, and capitalized labels may look off-center even when their boxes are mathematically centered. Keep a restrained correction tokenized at component or vector level. Match an icon's apparent stroke to adjacent text and keep icon family and stroke logic consistent within a surface. A 1.5 px stroke beside regular text and a 2 px stroke beside semibold text is only an illustrative starting point. Verify the actual icon view box, rendered size, renderer, and font weight. [[49]](https://www.ui-skills.com/playbook/align-icons-optically) [[50]](https://www.ui-skills.com/playbook/match-icon-stroke-weight)

### Make spacing express hierarchy

Name spacing tokens by visual job, such as inline icon gap, control inner gap, card content gap, module gap, and section gap. Labels such as small, medium, and large alone allow the same token to drift across unrelated contexts. Extra space around a top-level heading can signal prominence, while a smaller gap between a heading and its associated content signals relationship. [[9]](https://carbondesignsystem.com/elements/spacing/overview) [[1]](https://www.nngroup.com/articles/visual-hierarchy-ux-definition)

A useful spacing scale creates grammatical relationships. Icon-to-label, label-to-value, and title-to-supporting-copy gaps form a tight family. Gaps between content groups are more open. Gaps between cards and at section transitions are more open again. During early exploration, test an inter-group gap at about 2 times the intra-group gap, such as 16 relative to 8, but treat this as a contextual illustration rather than a universal pixel rule. A 4-unit base can provide intermediate steps. Actual values depend on type metrics, density, viewport, content, and the established tokens. [[46]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-layout/SKILL.md) [[40]](https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/reference/layout.md)

Not every gap needs a mathematically unique value. Begin with a small set of semantic tiers, then tune with authentic content. For sibling rhythm, a parent's `gap` expresses the relationship more clearly than unrelated margins on each child. Repeated title-value pairs should share a rhythm. A pause before an editorial region should use a different tier. The space between a summary and its action should communicate their relationship rather than look like leftover room.

Vertical rhythm need not be uniform. A frequent utility zone can be compact, a comparison region dense, a navigational collection moderately dense, and an editorial pause spacious. Separate visually similar adjacent sections with a larger gap or a meaningful surface change.

### Define density as information per decision

Avoid treating compact and spacious as page-wide binary modes. Tune density by information per decision. Repeating several nearly identical labels does not improve a decision merely because more information is visible. It increases visual load. Whitespace is not unused inventory; it frames focal content and punctuates sections.

Provide deliberate density modes when the system needs them:

| Mode | Appropriate purpose | Constraint |
|---|---|---|
| Compact | Frequent controls, tabular comparison, or high-information scanning | Labels, focus indicators, and adjacent targets must remain distinct |
| Default | General reading, browsing, and mixed content | Preserve clear grouping and stable component geometry |
| Breathing | Editorial emphasis, a reset between dense regions, or framing a focal object | Blank space must support priority or reading cadence |

Compact density never justifies overlapping controls, clipped labels, concealed focus indicators, or unstable geometry during state changes. In dense regions, visible whitespace may decrease, but labels, focus treatments, and neighboring targets must not merge. In spacious regions, blank area is earned only when it frames the focal object or improves reading cadence.

The main density tradeoff is visibility versus comprehension. More spacing can strengthen hierarchy while reducing the amount of useful content visible at once. Invest spacing at major group boundaries and use disciplined compactness within comparable sets. A container can clarify a functional group, but repeated containers can create fragmentation or an advertising-like appearance. Use boundaries for functional grouping and whitespace for ordinary flow.

### Preserve scanning during responsive change

Do not squeeze a wide layout into a narrow width. Keep the essential title and key value visible, allow metadata to wrap or stack, and make continuation of a horizontal rail clear. If a section action crushes its heading, move the action to another line. Visual reading order must remain compatible with semantic order; media, heading, and action should not become unrelated islands after reflow.

Long pages need scanning landmarks rather than endless sameness. A deliberate sequence of dense collection, breathing gap, navigational block, and focused editorial region creates a rhythm. In a blur review, verify that one saturated image has not accidentally become the page's primary region. Shared heading and action placement should remain predictable across similar modules.

### Use a coherent shape grammar

For nested rounded surfaces, a concentric formula is a useful geometric starting point:

`inner radius = outer radius - inset or padding`

This brings the inner and outer arcs closer to a shared center. It is not a final truth. Border thickness, unequal padding, very small radii, non-circular corner curves, and the box model can change the rendered relationship. Clamp a negative result to zero. If a tiny control's shape collapses, use the component token. With unequal inset, inspect the relevant axis and rendered corner. Optical review is mandatory after applying the formula. [[47]](https://www.ui-skills.com/playbook/use-concentric-border-radius) [[48]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-ui/SKILL.md)

Define radius by role. Image frames, cards, inputs, and buttons may share a radius or use documented steps. Randomly distributing 8, 12, 16, and full-pill radii makes the shape language unclear. A pill is valid for a compact chip or action, and a sharp corner is also valid. Neither is a universal shortcut to premium quality.

Add a nested shell only when it communicates material depth, selected state, or media framing. An outer shell, border, inset, and shadow on every card creates border accumulation and excess visual weight.

### Review structure systematically

Use these checks before approving a composition:

- **Grayscale check:** Is hierarchy readable without hue?
- **Blur or squint check:** Do the intended 2 to 3 masses appear first?
- **Outline check:** Is the page filled with unnecessary nested rectangles?
- **Rail check:** Do major edges and section actions use consistent axes?
- **Comparison check:** Do stable title, value, and action positions support rapid comparison?
- **Image-purpose check:** Does each large image have one clear informational or contextual job?
- **Promotion check:** Does a central graphic resemble an external advertisement rather than integrated content?
- **Density pulse check:** Does a long page alternate dense and breathing regions deliberately?
- **Template check:** If logo and palette are removed, does the composition still feel authored rather than assembled from generic defaults?
- **Originality check:** Does differentiation come from art direction, rhythm, typography, and system behavior rather than mimicry?
- **Responsive check:** Do priority, semantic order, labels, and visible states survive every supported width?

## 4. Typography and reading comfort

### Define roles by purpose

Choose type roles before choosing a typeface. Material's display, headline, title, body and label vocabulary is a useful precedent for purpose based naming [[10]](https://m3.material.io/styles/typography). Define each role by the work it performs, not by an arbitrary size such as "18 semibold."

| Role | Visual job | Content behavior |
|---|---|---|
| Display or promotional | A short editorial or campaign voice | Use for a brief statement, not for essential facts or routine tasks |
| Page heading | Establish the current page, view or detail context | Allow wrapping while keeping the screen title clear |
| Item title | Identify a card, row or summary | Keep comparison layouts stable, while making the complete title available in a detail context |
| Body | Present descriptions, guidance and explanatory copy | Use a comfortable line length and leading |
| Label or metadata | Identify filters, counts, units and states | Stay concise without making meaningful information hard to read |
| Numeric value | Present money, quantity, measurement, date or another key numeric attribute | Maintain numeric rhythm and semantic emphasis |
| Action | Label a button or link | Express the action hierarchy clearly and preserve the accessible name |

Do not mix task typography and expressive typography indiscriminately. Carbon separates productive type for task focus from expressive type for editorial or marketing use because dramatic typography can distract inside a product [[11]](https://v10.carbondesignsystem.com/guidelines/typography/overview). An expressive face or treatment may be appropriate for a short display line. Search fields, filters, item titles, specifications, numeric facts, controls and state messages need stable task typography.

Each type token should define its family, fallback, size, weight, line height, tracking and numeric behavior together. This prevents one nominal role from acquiring unrelated metrics in different components. A final typeface can remain undecided while roles are established, but both the preferred face and every fallback must render the required writing systems, currency signs, digits, percent signs, punctuation, multiplication signs, abbreviations and long identifiers clearly.

### Build hierarchy with more than size

Do not assign a new size to every step in the hierarchy. Use the minimum effective combination of size, weight, spacing and color. A large light heading can rank above a small bold label, so weight alone does not communicate importance [[11]](https://v10.carbondesignsystem.com/guidelines/typography/overview).

Do not make an identifying title and its key numeric attribute compete. The title establishes identity; the number communicates a decision fact. A current value can use strong neutral text while the title remains clear but slightly calmer. Counts, units, availability and other decision bearing facts must not default to tiny gray text. Give meaningful facts a readable size, sufficient spacing and compliant contrast. Secondary means lower emphasis, not faint or disposable.

Use all caps carefully. Sentence case or title case usually supports faster scanning for headings and actions. Keep decorative alternates away from long copy, numeric values and status messages. Store ordinary interface copy in natural sentence case, and apply the rare visual uppercase treatment through styling rather than changing the underlying words [[54]](https://www.ui-skills.com/playbook/use-sentence-case-labels). Small uppercase labels may benefit from modest positive tracking, but routine controls should not be styled as decorative labels.

Links in running text need a non-color cue, normally an underline. Tune the underline to the active font with from-font metrics, offset, thickness and skip-ink behavior so it stays distinct without colliding with descenders [[51]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-typography/SKILL.md) [[42]](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/taste-skill/SKILL.md).

### Control measure, wrapping and text growth

For paragraph-like descriptions and help copy, Baymard suggests a practical range of 50 to 75 characters per line [[12]](https://baymard.com/blog/line-length-readability). This is practitioner guidance, not a conformance rule. Do not apply it to card titles, specification tables, chips or compact numeric rows. Give body copy a maximum measure on wide screens, then let it use the available width naturally in narrow viewports. A range of 60 to 75 characters can be a useful starting focus within the broader guidance, but the final measure must respond to the face, language and container width [[51]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-typography/SKILL.md) [[56]](https://www.ui-skills.com/playbook/cap-line-length).

Fixed-height text boxes are fragile. Text must resize to 200% without loss of content or functionality [[5]](https://www.w3.org/TR/WCAG22/). Ordinary vertically scrolling content must also reflow at the equivalent of 320 CSS px without two-dimensional scrolling, except for content that is meaningfully two-dimensional [[5]](https://www.w3.org/TR/WCAG22/). Let titles, labels and buttons wrap or grow. Let a crowded numeric row stack. Keep important copy visible rather than clipping it or shrinking it below its role. Treat exceptions for genuine data tables narrowly; a grid, card or summary does not become a data table merely because it contains aligned content.

WCAG does not require every default body paragraph to have a line height of exactly 1.5. It requires content and functionality to survive when a user sets line height to 1.5 times the font size, paragraph spacing to 2 times the font size, letter spacing to 0.12 times the font size and word spacing to 0.16 times the font size [[5]](https://www.w3.org/TR/WCAG22/). Test cards, badges, tabs, chips, action groups and fixed headers under these conditions for overlap, clipping, hidden controls and lost labels.

As an illustrative tuning range rather than an evidence based limit, ordinary body paragraphs can begin around 1.45 to 1.6 line height and short headings around 1.25 to 1.4. Tune these values against the selected font and real content, and do not confuse them with the user-spacing resilience requirement above .

Wrapping behavior should match the content job. `text-wrap: balance` can even out a short heading, `text-wrap: pretty` can improve the ending of a short description, and `overflow-wrap: break-word` can contain a long identifier. Do not balance long prose, and do not assume a nowrap badge will fit. A one-line primary action can support desktop scanning, but never cut away meaning merely to force that line. First provide adequate width, then remove genuinely redundant words.

Sibling actions should follow one grammatical form rather than mixing nouns, sentences and slogans. An action label should name the specific action. Consistent grammar creates rhythm and makes differences in meaning easier to detect.

### Select by glyphs and metrics

Shortlist typefaces by required glyphs and metrics, not by a list of moods. Compare the preferred and fallback faces for x-height, cap height, numeral width, punctuation spacing, currency-sign alignment, symbol coverage and the availability of real bold and italic styles. Inspect common mixtures of letters, codes, slashes, percentages, multiplication signs, dates, units and grouped numbers.

Synthetic bold or italic can alter width and texture enough to change wrapping. Load only the weights and styles that are used. Disable synthesis only when doing so will not remove meaningful emphasis in fallback conditions. Prefer broadly supported controls such as `font-weight`, `font-optical-sizing` and `font-variant-numeric` to raw variation tags when a fallback friendly declaration can express the requirement [[51]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-typography/SKILL.md) [[52]](https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/reference/typeset.md).

Test titles, actions and key amounts before the preferred font arrives, while it loads slowly and after it fails. A weak symbol should be solved by choosing an appropriate font or fallback, not by adding fragile per-instance nudges.

### Tune leading and tracking for the rendered role

Do not apply one line-height ratio across the entire interface. A short display heading can use tighter leading, but the same setting can cause collisions when the heading reaches three or more lines. Wider prose generally needs more leading. A unitless line height scales with the role's font size and is usually more resilient than a fixed line box.

Light text on a dark surface can appear thinner in some faces. Test whether weight, tracking or leading needs compensation rather than assuming a universal formula. For large display type, slight negative tracking may help, but the correct value is font specific. Inspect default kerning, common letter pairs, punctuation and narrow viewports before changing it [[51]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-typography/SKILL.md) [[52]](https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/reference/typeset.md) [[53]](https://www.ui-skills.com/playbook/tune-tracking-by-size).

Do not separate adjacent roles using only a 1 px size difference and one weight step. Spacing and tone can establish a clearer relationship. Qualifiers, limitations, comparison bases and current states can affect a decision, so styling them as barely visible captions is not a valid hierarchy. Every muted foreground and surface pair must remain readable [[55]](https://www.ui-skills.com/playbook/keep-secondary-text-readable).

### Load fonts without destabilizing content

Font fallback is part of layout design. System fonts require no download and can work well for body text [[13]](https://web.dev/articles/font-best-practices). If a display face is unavailable, titles, identity, values and actions must remain readable, and fallback metrics must not break a card, row or button.

Choose loading behavior by role. Body and task text can use a system face directly or use `font-display: optional`. The optional strategy avoids a late font swap and its layout shift, but the downloaded face may not appear when it arrives too late [[13]](https://web.dev/articles/font-best-practices). A short distinctive display role may use `swap` when the file is delivered early and the fallback metrics have been tuned. Otherwise titles, values and buttons can move after rendering. Use measured metric overrides such as `size-adjust` when fallback differences justify them [[13]](https://web.dev/articles/font-best-practices).

Prefer WOFF2 where appropriate, preserve every required glyph when subsetting within the font license, and preload only resources shown to be critical. Preloading every weight competes with other important resources [[13]](https://web.dev/articles/font-best-practices). A variable font can replace several static files through axes such as weight, but one variable file is usually larger than one single-style static file and becomes worthwhile mainly when many styles are genuinely used. Inventory actual roles first. Do not animate weight on labels, values or buttons when changing glyph widths would move adjacent content [[13]](https://web.dev/articles/font-best-practices).

## 5. Color, contrast, surfaces and themes

### Define semantic color before pigments

Define semantic roles before selecting a palette: primary text, secondary text, link, key current value, superseded value, focus, error, warning, success, base surface, raised surface, tinted section and border. One pigment should not carry several unrelated meanings. Keeping running text generally neutral and reserving action color deliberately can create useful separation [[11]](https://v10.carbondesignsystem.com/guidelines/typography/overview). This is a separation principle, not an instruction to adopt another system's brand color.

| Meaning | Cue required in addition to color |
|---|---|
| Selected option or filter | Checkmark, border or explicit selected state |
| Error, warning or success | Distinct icon shape and meaningful text |
| Link in running text | Underline or another non-color distinction |
| Superseded monetary or numeric value | Relationship label and strikethrough where appropriate |
| Unavailable item or function | Clear status text, not only a faded image or control |
| Distribution shown by bars or segments | Numeric labels that communicate each value |

Color cannot be the sole visual means of communicating information or state [[5]](https://www.w3.org/TR/WCAG22/). Give a color swatch a text name and selected indicator. A green number or red warning remains ambiguous without a label or another cue. Whether an accessible name is visible or visually hidden, it must match both the displayed meaning and the behavior.

Build a complete surface and state matrix for every semantic role before treating the palette as finished. Expressive color can appear in editorial surfaces and accents, while facts and controls retain predictable mappings.

### Test rendered contrast pairs

Normal text needs a minimum contrast ratio of 4.5:1. Qualifying large-scale text needs 3:1, and WCAG defines large-scale text as at least 18 pt or 14 pt bold [[5]](https://www.w3.org/TR/WCAG22/). Required component and state visuals, along with meaningful graphical objects, need 3:1 against adjacent colors [[5]](https://www.w3.org/TR/WCAG22/). These ratios are minimum requirements, not palette generation targets.

A semantic token name or raw hexadecimal value does not prove contrast. Test the rendered pairs for:

- Primary, secondary, link, current-value and superseded-value text on base, raised, tinted and promotional surfaces.
- Default, hover, pressed, selected, focus-visible, error and disabled states.
- Badges over imagery, text over gradients and content over changing image crops.
- Field borders, selection marks and focus rings against every adjacent surface.
- Loading placeholders, unavailable states and other low-emphasis presentations.
- Light and dark mappings independently when both themes exist.

Composite translucent colors over each actual background before measuring. A crop change can alter the contrast of an overlay. Review grayscale and color-vision simulations as defect-finding aids, but do not treat a simulator as proof. Measure contrast and verify non-color cues directly [[5]](https://www.w3.org/TR/WCAG22/).

Do not turn the inactive-control contrast exemption into a broad license for faint content. A truly inactive control is a specific case. An unavailable value, explanation, limitation or factual qualifier can still matter and must remain readable. Communicate a disabled action through truthful non-interactive behavior and a clear state, not faint color alone.

### Give surfaces distinct jobs

Assign clear functions to base, raised and tinted surfaces. A base surface is the ordinary working canvas. A raised surface indicates overlap or focused grouping. A tinted surface separates a meaningful region. Elevating every card or row makes depth hierarchy meaningless.

In a light theme, shadow can communicate elevation. In a dark theme, a surface step or border can be more dependable. In every theme, test the actual boundary against adjacent colors and verify focus visibility.

Promotional or expressive surfaces must not reduce the contrast of factual content. Over a gradient or photograph, use a stable text panel or a verified overlay. Do not bake informative copy into an image, because image text is less resilient to resizing and theme changes [[5]](https://www.w3.org/TR/WCAG22/).

Ask what each surface edge is meant to communicate: structure, elevation, state or material. A 1 px separator or border can communicate structure. A layered low-opacity shadow can communicate overlap. A dedicated ring can communicate selection or focus. A restrained inset highlight can suggest a particular material. Combine border, ring, inset line and shadow only when each layer has a separate visible job. Otherwise the edge becomes muddy, heavy and visually nested. A 1 px line is a practical recipe, not a mark of quality; inspect it with its adjacent colors on high-density rendering [[48]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-ui/SKILL.md) [[45]](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/soft-skill/SKILL.md).

Media with a light background can disappear into a light surface, while dark media can merge into a dark surface. A low-opacity neutral outline can establish edge consistency. A tinted outline may combine with media colors and the underlying surface to form a dirty halo. One practitioner recipe suggests low-opacity black in a light theme and low-opacity white in a dark theme, but the opacity remains contextual and the outline must not cover meaningful detail. Do not duplicate a media outline with another identical frame around its container [[59]](https://www.ui-skills.com/playbook/outline-images-neutrally) [[48]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-ui/SKILL.md).

An inset top highlight can suggest a convex or raised material, while a dark inner shadow can suggest a recessed field. Treat these as parts of a lighting model rather than decoration. Repeat the same light direction, radius logic and theme logic. Compose every theme independently because surface steps, translucency and vivid colors behave differently against dark backgrounds.

### Build perceptual ramps and semantic tokens

OKLCH can be a practical working color space because lightness and chroma can be adjusted more predictably than in HSL. Merely writing `oklch()` does not establish accessibility or harmony. Give every ramp step a job, such as canvas, surface, hover, separator, solid accent or text, then expose only semantic roles to components. Map primitive colors to roles such as `text-secondary`, `surface-raised` and `action-solid` rather than applying a hue token directly to a component. Without this seam, a theme change becomes a fragile global replacement [[57]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-colors/SKILL.md).

Build intentional steps in perceived lightness, keep hue reasonably stable within a ramp and consider reducing chroma near the almost-white and almost-black ends while allowing it to peak nearer the middle. Equal numeric chroma does not look equally vivid across hues, and some combinations fall outside the sRGB gamut. If a wide-gamut P3 accent is used, provide an sRGB fallback first and override it only in a supported gamut. Unsupported values or clipping must not turn a semantic state into an accidental hue. Measure the rendered and composited pair. An OKLCH lightness difference, semantic token name or visual judgment is not a contrast ratio [[57]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-colors/SKILL.md) [[58]](https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/reference/colorize.md).

A gradient can create atmosphere or hierarchy, but it is not compulsory polish. Its interpolation space changes its appearance. Oklab often keeps brightness transitions more even. OKLCH can follow a route around the hue wheel between two hues. Default sRGB interpolation can make the midpoint darker or more muted. Choose stops and interpolation according to the visual intention, then measure text overlays at every relevant crop and state. Flat color, gradient, texture and photography are all valid when content remains legible and the system remains coherent [[57]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-colors/SKILL.md).

### Establish a complete theme policy

Do not assume a light theme is universally superior or a dark theme is automatically a premium feature. Whichever theme is offered must have a complete semantic matrix. Verify text, surfaces, borders, links, numeric facts, statuses, focus treatment, disabled states, overlays and media edges.

Include a dark theme only when every text, surface, border, focus and status role is remapped rather than mechanically inverted. Simple inversion can distort media backgrounds and semantic colors. Check transparent media, white media backgrounds and edge halos. Avoid full-white long-form text on an almost-black surface if a softer high-contrast neutral is more comfortable while still meeting the required ratio. Reduce dependence on shadows where borders and surface steps carry hierarchy more reliably. Retest every alpha overlay and interaction state [[5]](https://www.w3.org/TR/WCAG22/).

Dark surface steps can appear closer together, vivid accents can glare and translucent layers can composite unpredictably. Independently compose the full surface stack and edge contrast in each theme. Theme changes must not rearrange content, change labels or alter behavior. Honor the user's selected theme. One thoroughly verified theme is safer than an incomplete theme switch.

### Use color to support, not replace, action hierarchy

A filled accent is one way to make a primary action dominant, not a universal requirement. Strong neutral fill, size, placement, whitespace and label clarity can also create emphasis. If filled accent is the primary-action code, do not give peer actions in one decision cluster the same saturation and weight, or the cluster will appear to contain several primary actions.

Do not erase legitimate status, selection or data-series colors in pursuit of a simplistic one-accent rule. Those colors have distinct meanings and still need non-color cues. Accent can appear on static content when the visual direction supports it. However, if the same hue has become an exclusive learned signal for interactivity elsewhere, using it on static content creates ambiguity [[57]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-colors/SKILL.md) [[58]](https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/reference/colorize.md).

Check an action's contrast in default, hover, active, focus and disabled states, and over every image or tint on which it appears. A low-chrome action over photography may need a stable scrim, surface or stroke. Reserve decorative color deliberately if rarity is meant to attract attention, but do not confuse forced monochrome or a ban on color with originality.

## 6. Numbers, currency, units and locale

### Treat a number as a semantic statement

A displayed number is not merely bold digits. Its meaning can depend on a label, sign, previous value, unit basis, time zone, precision and supporting qualifier. Establish that relationship in both visual and reading order.

For monetary content, the current amount should normally be the strongest neutral text in its group. Show a previous or list amount only when authentic data establishes that relationship. Add a visible relationship label and a strikethrough where that convention is appropriate; gray or red alone cannot mean "previous." Show a saving, discount or change only when source data supports it. Never invent a percentage, crossed-out value, decimal fraction or promotional label for visual polish.

Place a meaningful unit value close to the primary amount, with a truthful basis. Do not detach pack size, rate basis, tax status, availability or another essential qualifier into barely visible microcopy. When the underlying value is missing, use explicit unavailable text rather than substituting zero, fabricating an old value or leaving an unexplained blank.

Use the same semantic order wherever the same value group appears. A compact context can use tighter spacing, while a detail context can provide more room, but current, superseded and unit roles must retain the same meanings. Decoration associated with a category or content type must not reverse their visual hierarchy.

### Format values through locale data

Generate numbers, currencies, dates and units with locale-aware formatting rather than inserting separators or symbols by hand. Currency symbol placement, spacing, sign ordering and grouping patterns belong to locale data [[15]](https://cldr.unicode.org/translation/number-currency-formats/number-and-currency-patterns). The same currency can be written differently in different locales, and the same separators can carry different meanings. Store an unformatted value and its semantic unit separately from its presentation.

Grouping must follow the active locale. Some locales group large values in sets of three digits, while others use an initial three-digit group followed by two-digit groups. This is why handwritten comma insertion is fragile. Review authentic fixtures with 1-, 4-, 5-, 6-, 7- and 8-digit values, as well as larger supported values. Include optional fractions only when the data can contain them, and include a negative value only where it has a real semantic meaning.

Every required currency sign must be present and well drawn in both the primary and fallback fonts. For instance, the modern Indian rupee sign has Unicode code point U+20B9 [[14]](https://kb.itextpdf.com/itext/how-to-display-indian-rupee-symbol). Regardless of currency, inspect the sign's shape, baseline, weight and spacing beside digits. Do not turn a currency sign into a decorative superscript if that makes the amount harder to read as one unit. If fractional currency data is absent, do not add trailing zeros merely to align the display.

Dates require the same discipline. Use locale-appropriate ordering and names, preserve the intended calendar and time zone, and include enough context to prevent an all-numeric date from being interpreted in more than one order. Do not hard-code punctuation around date parts. When time-zone differences affect meaning, communicate the applicable zone rather than relying on the viewer to infer it.

Units must remain attached to their values semantically, even when spacing or line breaks separate them visually. Use the unit and precision supported by the source data. Do not silently normalize rates, dimensions, durations or quantities unless the conversion is valid, its precision is honest and the resulting basis is visible.

### Choose numeral styles for the task

Proportional numerals can give an isolated prominent value a natural text texture. Tabular numerals are useful when values must align vertically or update in place, including comparison columns, quantities, totals, changing counters and repeated same-axis rows. Equal-width digits can reduce visual jitter, but tabular figures are an alignment tool, not a brand style.

The chosen font must support the numeric feature for `font-variant-numeric: tabular-nums` to have an effect [[16]](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variant-numeric). Do not apply tabular figures indiscriminately across all prose and display type. Even with equal-width digits, decimal points and grouping separators do not align automatically. Check column alignment, currency placement and missing-value treatment using real fixtures [[60]](https://www.ui-skills.com/playbook/use-tabular-nums-for-data) [[51]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-typography/SKILL.md).

Align numeric columns according to the comparison task. Keep the same decimal or other meaningful axis visually consistent where possible, while preserving signs, units and qualifiers. A typographic alignment must never imply that unlike measures share a basis. Labels and units remain visible when they distinguish values.

Inspect numeric texture at glyph level. Currency signs, grouping separators, decimal marks, percent signs, slashes, multiplication signs, plus and minus signs and digits should share a coherent baseline and optical color in the active face. A sign can use a different size or weight when the semantic unit remains clear, but ornamental treatment must not disrupt reading order.

### Space numeric relationships deliberately

Hierarchy comes from spacing as well as size. A currency sign and amount form one semantic unit. A current and superseded value are related but separate clauses. A unit rate or quantity basis may form the next comparison line. Do not use one generic gap for spacing within an amount, between current and previous values and before supporting metadata.

Making a superseded value an exact visual twin of the current value and adding only a strike creates noise. Give the former a lower but still readable role and retain a clear relationship label. A strikethrough alone is not sufficient because it can be missed visually and does not necessarily communicate meaning to assistive technology.

Avoid ambiguity between visually similar numeric values. Preserve enough labels, precision, signs and unit information to distinguish them. Do not depend on color, relative position or one separator alone. If two values differ only by a decimal, sign, time zone or unit basis, increase the clarity of that distinguishing information instead of relying on careful inspection.

### Make numeric layouts resilient

Let value groups wrap or stack at narrow widths and at 200% text resize. Do not place a currency sign, amount, previous value and unit qualifier in one unbreakable line. Visual order and accessible reading order must communicate the same semantic statement. Programmatic labels and relationships must preserve meaning that visual styling, including strikethrough, size or alignment, cannot convey by itself.

Current values must meet text contrast requirements and must not be identified by hue alone. Superseded values may have lower emphasis but cannot become unreadable. A unit qualifier may be smaller, but if it is essential for comparison it is not decorative metadata.

Never let layout depend on an assumed digit count. Review short and long grouped values, fractions present and absent, percentages, signed values, quantity multipliers, unavailable values, absent previous values, long unit labels and narrow columns. Font fallback and theme changes must not cause a long value to cover an action or push unrelated content out of alignment.

For changing values, digit width, grouping changes and line height must not make nearby actions jump. Prefer a stable minimum region plus defined wrap or stack behavior to a fixed-height box. Tabular numerals can reduce digit-width movement, but they cannot solve changes in digit count, separators, symbols or units.

### Preserve meaning in columns and speech

When aligning a comparison, normalize units only when authentic data and a valid conversion allow it. Do not silently present a unit rate, package amount and total as equivalent entries in one numeric column. Keep the label, basis and locale formatting visible.

A dash can represent a missing value only when the interface makes that meaning explicit, such as through a clear column convention or legend. Explicit unavailable text is often safer when the reason or state matters. Do not use zero as a missing-value marker unless zero is the actual value.

Screen-reader order should preserve the same comparison statement as the visual columns. Provide accessible text that makes signs, currencies, dates, units, fractions and superseded relationships understandable, then test the spoken output of the chosen formatter and assistive technology. Do not assume that a visually familiar symbol, grouped string or strikethrough will be spoken with the intended meaning.

The final test of numeric typography is faster, truthful comparison rather than visual drama. At a glance, equivalent primary values should align across a row or column. On inspection, currency, unit, precision, qualifiers and previous-value relationships should be unambiguous. At zoom and during fallback, the group must remain intact. If an oversized number erases the identity it describes, or a tiny unit basis makes a favorable comparison misleading, retune the hierarchy. Numeric emphasis must never outweigh the truth of the decision.

## 7. Imagery, media and art direction

### Coherence without forced sameness

An image system should help people identify an item, compare it with related items and understand its scale or context. Consistency does not require every image to use the same white background, crop or camera angle. Establish consistency through the media frame, a related family of lighting and backgrounds, edge treatment, image quality and clearly defined gallery roles. Adapt the presentation to the type of subject and the way people evaluate it.

Assign each available asset a role. Useful roles include a clean whole-item view, an alternate angle, a context or in-scale view, a decision-critical detail, included parts, an option-specific view and a dimensions or relationship diagram. Not every item needs every role. Existing curated imagery may be reused rather than requiring a unique set for every record. If a reused image does not depict the exact selected option, state that limitation beside the image rather than allowing the image to imply exact correspondence.

Treat the primary image as evidence, not merely as a mood asset. A useful set separates three basic purposes:

- **Main:** show the complete item and its recognizable silhouette.
- **Detail:** show a verified material, feature or construction point at useful proximity.
- **Context:** explain use and plausible scale.

Do not force all three roles onto every item, but do not crop one source image into several frames and present those crops as independent proof. Background, color grade and framing can establish visual character, but they should not compete with the subject. Coherence should come from a treatment family, not from forcing every subject into one crop. [[61]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/ecommerce-image-workflow/SKILL.md) [[62]](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/imagegen-frontend-web/SKILL.md)

When physical size or relative scale affects a decision, pair a clean view with a credible in-scale frame. Show the subject beside a familiar person, body part, object or environment that provides a meaningful visual reference. Testing of item detail pages found that people try to infer scale from imagery, so an in-scale view is part of understanding rather than a decorative lifestyle frame [[17]](https://baymard.com/blog/in-scale-product-images). In the cited study, 42% of participants attempted to gauge overall scale and size from images, and the first action of 56% of participants was to explore the imagery. These are observations from a 2017 commerce study, not a universal prediction for every interface. [[17]](https://baymard.com/blog/in-scale-product-images)

### Type-aware framing, crop and background

Keep the outer media proportion stable within a collection, row or comparable item type so that titles, numeric attributes and actions do not jump vertically. The subject does not need to occupy an identical percentage of every frame. A tall object and a wide object may need different optical scaling inside the same box. Clean cutouts, contextual scenes and detail close-ups may form separate image families while sharing an overall standard of quality.

Use a contain treatment by default when the full silhouette, package, attachment, port, control, label or outer edge carries meaning. Use a controlled cover crop for on-person imagery, contextual scenes or editorial discovery tiles only when the crop does not remove a decision-relevant part. Do not cut off a meaningful extremity, handle, control panel, footprint, quantity label or other identifying feature. A stable frame with adaptive fitting is a better general rule than one global crop behavior.

Keep background treatment related rather than identical. Neutral cutouts can form one family and contextual scenes another. This preserves collection-level rhythm without making every item look cloned. Store media role or treatment metadata where possible, such as clean view, on-person view, context, detail, scale or diagram, rather than attempting to infer the correct crop from file dimensions alone.

Do not bake ratings, discounts, calls to action or changing status into image files. Such information becomes stale when an option changes or an image is resized, and it is inaccessible to people who cannot perceive the pixels. Render badges and actions in the interface layer, derive them from current state and keep their density restrained. The image system need not lock the final brand palette or photography style before those choices are ready.

### Responsive frames, loading and failure

Reserve the media region before its source loads so surrounding cards and controls do not shift [[3]](https://web.dev/articles/optimize-cls). A primary image may be prominent, but it must not push the title, key numeric attribute or gallery navigation beyond a practical route to discovery. Do not stretch a low-resolution source into an oversized blurred presentation. If a source cannot support useful enlargement, present its available resolution honestly instead of simulating detail.

Image failure must not collapse the established aspect ratio. A missing-media state should name the item or identify the media status. Show a retry control only when a real retry can occur. Never use an approximate stock visual as if it depicts the exact item. The interface must preserve the item title, selected option, key numeric attributes and core specifications even when zoom, swipe, the carousel or all imagery is unavailable.

Design explicit fixtures for media cardinality:

- **Zero media:** retain a stable frame, identify the item and state that no image is available. Do not use a generic image that implies exact appearance.
- **One media item:** do not add inactive carousel arrows, fake thumbnails or repeated crops. Offer enlargement only when the source contains additional inspectable detail.
- **Many media items:** provide direct thumbnail access, previous and next controls, position text and an alternative to gesture navigation.

### Alternative text and accessible media controls

Alternative text for a meaningful image should identify the visible subject and the purpose of the view, such as its front view, detail view or scale context. If a nearby caption already provides the same information, do not repeat it as a paragraph in the alternative text. A decorative background texture, repeated duplicate thumbnail or purely ornamental flourish may use empty alternative text.

The accessible name of an option control must not depend on image alternative text. A visual color or pattern swatch needs its own name and selection state. Media-type markers for video, a 360-degree view or a dimensions diagram also need accessible labels. Keep captions and labels outside the image when possible so they can wrap, resize, translate and remain readable independently of the crop.

### Generated and altered imagery

Treat generated imagery as constrained synthesis, not proof of an item's identity. A reference image is an input, not an identity guarantee. Without a real reference, do not present a generated depiction as visual proof of a particular item. Even with a reference, inspect shape, silhouette, color, material, logos and labels, ports, seams, fasteners and proportions. If a generation system cannot accept the reference needed for fidelity, do not describe the output as faithful.

A generated feature image must not invent certification, ingredients, dimensions, performance figures, accessories or other factual properties. Avoid tiny generated text. Leave clean copy space and add verified interface text separately. Keep scale plausible across frames, and ensure that fixed features remain stable from one view to another. [[61]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/ecommerce-image-workflow/SKILL.md) [[63]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/ecommerce-image-workflow/references/checklist.md)

If selecting an option causes an image to lose a verified mark or gain a feature that does not exist, replace it with a verified option-specific image or state locally that an exact preview is unavailable. Remove generated performance text when no source supports it. Reframe a context image if a person or prop obscures the subject. Do not present generated or placeholder imagery as final documentary photography. Keep internal provenance traceable, and disclose limitations in exactness near the decision they affect. [[63]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/ecommerce-image-workflow/references/checklist.md) [[64]](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/assets.md)

## 8. Cards, list items and collections

### The visual job of a card

A card is not a compressed detail view. Its job is to establish identity within a result set, expose relevant differences and provide a predictable route to more detail. Comparable cards should place comparable attributes in consistent locations. Scanning breaks when the same attribute appears as a paragraph on one card, as part of the title on another and as a badge on a third. Listing research supports both consistent inclusion of attributes across similar items and clear visual distinction between information elements [[2]](https://baymard.com/blog/list-item-design-ecommerce). In a 2023 commerce benchmark, 64% of evaluated sites did not adequately present list-item attributes, and the study associated that failure with some site abandonment. This is evidence about commerce listings, not a universal percentage for every kind of collection. [[2]](https://baymard.com/blog/list-item-design-ecommerce)

A practical card anatomy is:

| Layer | Required meaning | Optional when decision-relevant |
|---|---|---|
| Media | Item image or media placeholder, linked media where appropriate, honest relation to the selected option | One restrained status badge |
| Identity | Type or category cue, concise title | Family, source or condition |
| Comparison | Key attributes for this item type | Option range, package choices or compatibility cue |
| Key value (where the entity has one) | Current numeric value and any applicable qualifier | Reference value, unit value or verified saving |
| Confidence (where evidence exists) | Evidence summary with its count or scope | Provider or availability note |
| Actions | Predictable route to detail | Save, compare or another familiar secondary action |

Make the image and title clear routes to the detail view when they are interactive. Save, compare and similar controls should be real buttons rather than clickable decoration. Give unfamiliar icons accessible names and visible labels where space permits. Do not let keyboard focus disappear into the card border. Communicate selection with more than color.

### Fixed slots with type-aware information

Use a stable core structure within a comparable collection, but adapt decision attributes to the entity type. Visual-first items may use larger imagery and fewer facts. Compatibility-led, technical or data-heavy items may use compact imagery and stronger aligned facts. In all cases, keep field order stable within a row so the eye can scan the same position from one item to the next.

Choose two to four decision-driving attributes rather than filling every card with generic praise or copied provider prose. Structured fields should generate a concise title and short comparison facts. The specific facts may concern dimensions, capacity, duration, material, format, compatibility, date, condition or another type-specific property. The universal rule is that attributes should reflect how people distinguish that item type, while their order stays consistent among directly comparable items.

Do not silently omit an unknown value in a way that makes the item appear inferior to another. Show an explicit unavailable-information state, or apply a collection-wide omission policy that removes the attribute from every comparable row. Keep units and notation consistent within the same comparison group. Do not mix incompatible representations of memory, volume, dimensions, dates or other values without a clear reason.

The following content grammar is a planning aid, not a fixed template:

1. Media and one compact status cue, only when the status is genuine and relevant.
2. A source or family line only when that identity affects the decision; otherwise begin with the descriptive title.
3. A title built from item type and a key differentiator, without promotional filler.
4. Type-specific facts in a stable order.
5. The primary numeric value, where the entity has one, followed by subordinate reference values or qualifiers.
6. An evidence summary with its count, where ratings or similar social proof exist.
7. Availability, option or provider context, where such context exists, and only when it changes the decision.
8. Secondary save, compare or related actions.

### Grid, list and collection rhythm

A grid can favor visual browsing, while a list can favor specification-led evaluation. A list may expose additional bullets, provider context or compatibility detail. When people switch between grid and list, preserve information parity for the task-critical information and states that each item carries, such as title, current key value, selected state and critical availability. Do not make a change of layout silently change the meaning of the result set.

Use equal media slots and aligned content regions to support comparison, but do not use a fixed card height that clips titles or values after text resizing. Let item names wrap. If line clamping is necessary, ensure that a decisive identifier, capacity, date, option or model is not the hidden portion. Shorten decorative or repeated wording before removing decision content. When truncation remains unavoidable, preserve the full accessible name and a route to the complete detail. Under WCAG reflow requirements, a narrow presentation should not lose information or function, except where the content is genuinely two-dimensional [[5]](https://www.w3.org/TR/WCAG22/).

Equal visual rhythm does not require a uniform content recipe for every collection. An inventory of equal-weight records benefits from regular cards. A curated collection may use intentional hierarchy. A specification-heavy result set may need structured rows. Do not use irregular card spans that accidentally imply importance. A minimal baseline of media, identity, key value and one secondary action is a starting point, not a universal maximum. Add decision facts, save or compare controls only when the task requires them.

Design zero, one and many results as deliberate states:

- **Zero results:** show an honest no-match or empty state, not a permanent listing skeleton.
- **One result:** keep the normal card width and reading grammar rather than stretching it into an unintended hero.
- **Many results:** reduce repeated descriptions, badges and surrounding chrome so actual differences create the rhythm.

Quick actions may appear on hover, but they must also appear on keyboard focus within the card and remain visibly reachable on touch or coarse-pointer devices. Never hide the core numeric value, selected option or availability behind hover.

### Truncation, density and badge restraint

Card density should respond to the collection's purpose. A visual discovery surface can prioritize media and concise facts. A comparison surface should prioritize labels, values and alignment. Do not force every possible specification into the card. Place majority decision facts in the collection, and reserve uncommon deal-breakers and long descriptions for comparison or detail views.

Repeated promotional adjectives do not help comparison. Replace vague labels with verified, structured properties. Limit a card to one restrained status badge when it genuinely changes interpretation. Do not cover image corners with simultaneous offer, trend, inventory and provider chips. If a badge merely fills space or repeats nearby text, remove it.

### Key values, options and pending state

Where an item carries a key value such as a price, quantity or measurement, make the current value the strongest text in its cluster. Reference values and discounts should be subordinate, and all arithmetic must agree. Use a range or "from" qualifier only when the card actually represents multiple values. Keep a useful unit value readable. Do not orphan a currency symbol, unit or qualifier on a separate line from the amount it qualifies.

When a person selects a card-level option, update the media, option label, key value and availability as one coordinated state. Do not show a new image beside the old option's value as though both are current. While dependent data resolves, keep the selected control visible, show a pending state only on affected fields and do not present a stale value as current without clearly labeling its previous status. An unavailable option may remain visible and disabled, but explain why and use a cue other than color.

If a rating is shown, pair the average with the count because the average alone does not provide full confidence context [[18]](https://baymard.com/blog/user-perception-of-product-ratings). More generally, any summarized evidence should disclose the amount or scope behind it. Synthetic, illustrative or incomplete data must be visibly labeled as such rather than styled as live evidence.

## 9. Detail views, galleries and option selection

### Information order in the first view

The first view of a detail surface should answer up to five questions, as far as they apply to the entity: what it is, whether it fits the person's need, what changes with the selected option, what the current key value is and whether the intended action is available. On a wide layout, the gallery and summary may appear in parallel. On a narrow layout, place media, identity, key value, options and primary action in a clear vertical flow. A sticky summary or action must not cover the focused control, an error message, essential content or browser interface.

Place type, family or model context near the title. A rating summary may link directly to the full evidence or review section. The key-value cluster must correspond to the selected option. If a required selection makes the primary action unavailable, place a direct instruction beside that action. Do not hide the reason for a disabled control inside a tooltip.

Sticky summaries should preserve the selected option, current value and primary action only when those elements remain useful during scrolling. They should not duplicate an entire header or conceal content. At responsive transitions, preserve state and reading order rather than rebuilding the surface around a different default selection.

### Gallery navigation and visual inspection

Pair the main media region with a thumbnail rail when additional media exists. Thumbnails provide a visual clue about upcoming content and allow a direct jump; anonymous dots and a numeric count do not provide the same information scent. In mobile testing, swipe was commonly used, while thumbnails provided larger targets and helped people identify image types before opening them [[19]](https://baymard.com/blog/always-use-thumbnails-additional-images). The cited testing reported that people almost universally used swipe for mobile gallery navigation, and associated thumbnails with fewer unintended targeting errors than smaller indicators. [[19]](https://baymard.com/blog/always-use-thumbnails-additional-images)

Swipe and thumbnail activation must update the same selected index, caption and position counter. Make the current thumbnail unmistakable with a non-color cue. A partially visible next thumbnail at the rail edge can indicate additional content. Keep the rail keyboard reachable, and scroll the active thumbnail into view. Label video, 360-degree media, detail views and diagrams by type. Preserve thumbnail access in an enlarged viewer [[19]](https://baymard.com/blog/always-use-thumbnails-additional-images).

Make tap or click to enlarge predictable. In the enlarged view, keep the title or item context, close or back control and current-media context visible. Pan and zoom can support pointer inspection, and pinch can support touch, but no gesture should be the only route. Provide accessible zoom in, zoom out and reset controls. After Escape or close, return focus to the gallery control that opened the viewer.

Keep the main image's swipe area separate from tiny indicator targets. Overlap between them can trigger unexpected enlargement and disorient the user [[19]](https://baymard.com/blog/always-use-thumbnails-additional-images). Detailed limits for pinch, double-tap, maximum scale, pan boundaries and orientation are not established by the cited gallery study, so settle them through current device testing rather than presenting one recipe as research-derived. [[127]](https://baymard.com/blog/mobile-image-gestures)

### Media order and cardinality

Order a gallery according to the questions a person is likely to ask, not asset filenames. Begin with a clear whole-item view of the selected option. Follow with an alternate angle, a decision-critical detail, scale or use context, and included parts or a dimensions graphic when available. Video can supplement a useful scale image, but should not be its only substitute.

Each thumbnail should make its subject recognizable in advance, and its label should identify the role, such as side view, detail or scale context. A long thumbnail label may wrap in a visible caption, but it must not reduce the hit area or selected outline.

If only one verified image exists, present one image. Do not create repeated crops, fake thumbnails or disabled arrows to imitate a gallery. With many images, provide thumbnails, previous and next controls, position text and alternatives to gestures. With no images, retain the stable missing-media treatment defined in section 7.

### Option controls and discoverable ranges

Use a visual swatch for an intrinsically visual choice such as color or pattern. Use a text chip for choices expressed as size, capacity, duration, package, format or another named value. Every swatch needs a readable name. Expose selection programmatically. Represent unavailability with text, an icon, a strike treatment or another non-color cue.

Do not silently hide part of a meaningful option range. Provide a clear route to reveal more, or use a horizontally scrollable set whose overflow is discoverable. Mobile commerce research identified concealed color ranges as a problem for item exploration [[20]](https://baymard.com/blog/mobile-interactive-color-swatches). Search evidence reported that 57% of studied mobile commerce sites made exploration harder by not exposing all color variations in listings. This percentage is a domain-specific benchmark, and the detailed rail recipe remains less well supported than the general warning against concealed ranges. [[20]](https://baymard.com/blog/mobile-interactive-color-swatches)

A compact additional-count control may reveal the complete set, but it must not imply that hidden choices are unavailable. Long option labels should wrap in the control or selected summary. Do not overlay them on the main image where they cover the subject.

### One connected state for option-dependent content

Treat option selection as one state transaction. After a selection, media, title suffix, key numeric value, availability, provider offer and committed payload must all represent the same option identifier. If option-specific media is absent, keep a generic image only with a local note that an exact preview is unavailable. Never describe an image of one option as though it depicts another.

If the key value or availability has not resolved, make the commitment action pending or unavailable. Do not let an action commit the previously selected option while the interface displays the new selection. Preserve the current valid selection when a newly requested option is unavailable; do not switch silently.

Keep an explicit media mapping for each asset: represented option identifier, media role and truth status. When the option changes, move the main view, active thumbnail, caption, count and enlarged viewer to the same media set atomically. If the user was viewing position four and the new set contains only two items, move to the first valid item rather than leaving a blank position, and update the visible context. When the viewer closes, return focus to the current thumbnail or main-media trigger, not to an obsolete control.

The most damaging failure is a split state in which a selected control, gallery and committed payload represent different options. Derive all dependent fields from one selected-option object. Keep factual feature text as verified interface copy beside a clean detail crop rather than embedding unreadable generated text in an image. Separate main, feature and context roles, and reject unsupported fidelity claims. [[61]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/ecommerce-image-workflow/SKILL.md) [[63]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/ecommerce-image-workflow/references/checklist.md)

### Specifications and secondary sections

Overview, specifications and reviews may use tabs on wide screens and labeled accordions on narrow screens. Preserve the current section when the layout changes. Present specifications as scannable label-value rows and normalize units. Long care instructions, methodology or secondary prose may use disclosure, but do not hide an essential limitation, included component or critical dimension behind a collapsed region.

Detail content must remain useful when the review panel, gallery enhancement or provider module fails. Scope errors to the failed module, keep core identity and facts available and offer retry only where retry is valid.

## 10. Ratings, social proof, promotional and third-party content

### Honest ratings and social proof

Never style illustrative, synthetic or incomplete social proof as a real endorsement. Label its status in the review heading or immediate context. Do not use real-person photographs, verified-status claims, sold counts, live-viewer counts or similar evidence without authentic support.

When ratings exist, show the average, total count and distribution from the highest to lowest rating together. The distribution gives people a clearer view of the spread behind an average [[21]](https://baymard.com/blog/user-ratings-distribution-summary). Keep totals synchronized across cards, detail summaries, filters and the full review section. Older commerce evidence reported that users relied heavily on rating distributions and that 43% of benchmarked sites lacked a distribution summary. Treat this as older practitioner evidence rather than a current universal benchmark. [[21]](https://baymard.com/blog/user-ratings-distribution-summary)

A review card may contain an alias, rating, concise title, body, date context and the option or version reviewed. Review-filter counts must come from the actual available dataset. An empty filtered result needs a clear route to remove or change the filter. Do not inject fabricated reviews to avoid an empty state.

If a review module fails, the detail view's core information must remain usable. Show a scoped error and a valid retry. Do not leave an apparently complete rating summary beside contradictory review counts. Expand and collapse controls need text labels, stable focus order and content that does not clip when text is resized.

An average without a count is insufficient context [[18]](https://baymard.com/blog/user-perception-of-product-ratings). More broadly, every social-proof summary should disclose its denominator, scope or source where that information changes interpretation. A visual seal, score or ranking must not imply verification beyond the underlying evidence.

### Promotional content as explanation

Promotional content should explain a change to the primary value, not become visual noise. Place one restrained offer cue near the value it affects. Explain the immediate effect, eligibility and impact on any shared total. Do not hide important exclusions in distant fine print.

When an offer is applied or removed, update the line amount, discount and shared total together. Show success only when eligibility and arithmetic have actually been applied. An invalid or ineligible state should state the reason and provide a route to correction. Derive a struck reference value, percentage and saving amount from one calculation so the interface does not tell three conflicting stories.

Use a clear reading order for a value block:

1. Current value.
2. Reference value, only when the same record supports the relationship.
3. Saving or other effect, derived from the same calculation.
4. A nearby qualifier describing scope, option, unit, provider or data status.

The current value is primary. A reference value is subordinate. A promotional badge must not be louder than the value it explains. Keep qualifiers beside the affected amount rather than moving them to a distant legal-footnote zone. If the amount changes by unit, package, selected option or provider, show that qualifier with the amount.

Do not use countdowns, invented scarcity, lucky-wheel mechanics, unsupported financing or payment cues, or language that implies a newly completed transaction without evidence. Never create urgency through a false low-stock count, fabricated live-viewer count, invented dispatch promise or unsupported popularity claim. These are content-truth rules, not merely stylistic preferences.

If no promotion applies, omit the discount row rather than showing an empty row or striking through an equal value. If one promotion applies, explain it directly. If several may apply, show the selected promotion's effect and place the rest in aligned secondary disclosure instead of stacking badges. Let a long eligibility label wrap without breaking its association with the amount.

### Availability without false urgency

Separate availability from urgency language. Useful states include available, unavailable, unknown and an option-specific provider note. Never coerce an unknown state into a positive badge. Do not claim that only a particular quantity remains, that a number of people are viewing the item, or that action must occur before a countdown expires unless current operational evidence supports the exact statement.

Unavailability should prevent only the invalid commitment and explain why. It should not erase detail, save, compare or other non-committing actions. Derive the card, detail view and pending-selection state from one availability record for the selected option and provider. Do not allow one surface to show available, another unavailable and a third to keep an invalid action enabled.

### Third-party and provider hierarchy

Keep third-party identity subordinate to the entity and selected option. A practical information order is:

1. Item identity and selected option.
2. Current offer or key value.
3. Provider name, attribution and condition.
4. Relevant neutral availability context.
5. A labeled disclosure for alternatives.

This hierarchy is a design synthesis for scan clarity and content honesty, not a finding backed by direct public testing of provider order.

When alternative providers or offers exist, use the same aligned column order for each row: provider, condition, value and availability note. Alignment should allow comparison of values without requiring people to parse differently structured prose. Do not elevate the provider name to the same visual level as the item's primary identity unless the provider itself is the entity being evaluated.

Where a product carries third-party content, attribute it clearly. Distinguish platform-authored information from provider claims, imported reviews, sponsored placement and other external material. Preserve the source, scope and applicable conditions close to the claim. Where alternative providers exist and a person switches provider, synchronize the detail offer, the selected payload and any preview total with that provider's offer. In a pending-selection summary, place provider context after the chosen option rather than before it.

Do not invent trusted or verified labels, service percentages, operating history, guarantees or, where third-party sellers or fulfillment are involved, marketplace protection, dispatch commitments or storefront capabilities. A third-party identity should link only to real available information and must not imply an operating capability that does not exist. If a proof slot has no authentic value, remove it or mark it as pending rather than filling it with an invented metric.

### Review and endorsement integrity

Ratings, reviews and endorsements must reflect real submitted or imported records and their genuine moderation state. Do not fabricate positive or negative reviews, suppress a distribution to conceal disagreement, or label an unverified interaction as verified. Counts, averages, filters and distributions should derive from the same dataset and update together.

Promotional prominence must never substitute for relevance or evidence. Remove a popularity badge that exists only to fill a corner. Use the space for an actual comparison fact, or leave it empty. Missing proof is not a visual defect to conceal.

## 11. Navigation, search and listings

### A familiar global frame

Global navigation should make the route to home or product identity, major content groups, search and, where the product supports them, saved items and pending selections recognizable. Originality should come from composition, art direction, typography and voice, not from turning familiar actions into mystery symbols. On wide layouts, a layered navigation bar can combine primary navigation with a grouped category menu, but search should remain a visual anchor. On narrow layouts, a compact row for menu, identity and high-priority utilities can sit above a full-width search field. Do not bury discovery in an icon-only state.

A wide-screen mega menu can present destinations in labeled groups. At narrower widths, the same information can become a drawer. Both forms must preserve the same destinations and information structure. Hover may enhance a mega menu, but it must not be the only way to open it. Click, keyboard and touch behavior must be deterministic. A drawer needs clearly identified parent context, Back and Close controls, and closing it must return focus to its trigger. Exploratory menu arrangements do not constitute approval of a final taxonomy.

Breadcrumbs should appear below the global frame and above the current view heading when they help users understand or move through a hierarchy. Keep the chain concise, preserve meaningful destination links for ancestors, identify the current location without presenting it as another destination, and allow long labels to wrap rather than clipping essential context. Breadcrumbs supplement global and local navigation; they do not replace a clear view title or a reliable Back path.

Persistent navigation surfaces may use a distinct surface or boundary when this clarifies their scope. Reserve elevation for navigation that genuinely overlays or crosses content rather than applying shadows to every navigation element.

### Search field and suggestions

A search field needs a persistent accessible name. A placeholder may show a supported query form, but it is not a replacement for a label. A visible label or nearby heading should establish the field's purpose, and activating the label should focus the field. Give the field a meaningful `name`, appropriate text-input behavior and the correct search context. Do not use reserved authentication-field names for unrelated inputs because this can confuse password managers. Where browser autofill is relevant, match it to the actual field purpose and keep non-authentication search separate from credential autofill [[68]](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/e3d624baaf29dc1fc645aff3e38f03e564d2d6b1/README.md) [[70]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-accessibility/SKILL.md).

Preserve the typed query across breakpoint changes, popup closure, a visit to a result and Back navigation. Input hydration, responsive recomposition and pending refresh must not discard either the value or caret. Show a Clear button only when there is content to clear, and give it a full accessible name such as "Clear search." Never block paste. Long names, identifiers and prepared values are valid input. Query prompts should demonstrate supported capabilities without implying unrestricted conversational or interpretive intelligence.

Visually separate suggestion groups such as recent queries, query completions, content groups and individual items. An item suggestion generally needs only a compact thumbnail, title and one useful qualifier. Keep the active keyboard suggestion synchronized with its visual highlight. In an editable combobox, Arrow keys can move through suggestions, Enter accepts the active suggestion and Escape dismisses the popup. Do not override ordinary browser text-editing keys [[22]](https://www.w3.org/WAI/ARIA/apg/patterns/combobox).

On mobile, keep the search field and Close or Back control visible while suggestions are open. The suggestion list must remain scrollable with the on-screen keyboard present, and its final row must not become trapped behind a sticky layer. A no-match state must preserve the entered text, present a supported correction as a suggestion when one is available, and never invent unrelated results.

### Enter, input composition and request timing

The current input grammar determines what Enter does. In a closed search field, Enter can submit the current query. When suggestions are open, Enter accepts the highlighted suggestion; if none is active, it submits the typed query. In a multiline field, Enter should remain a newline unless a modifier-based submission is both intentional and clearly communicated. Do not add redundant Enter or Space handlers to native buttons, because doing so can cause double activation. Arrow keys should continue moving the caret in editable text until an open combobox explicitly claims them for list navigation. Avoid intercepting normal selection shortcuts, Home, End and browser editing behavior [[68]](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/e3d624baaf29dc1fc645aff3e38f03e564d2d6b1/README.md) [[71]](https://raw.githubusercontent.com/PrototyperAI/prototyper-ui/main/apps/docs/skill/build-primitive/SKILL.md).

Do not interpret a keydown event for Enter during input method editor composition as final submission. Let composition complete, then run suggestion, filtering or submission logic against the committed value. Search as the user types must not fight typing by moving focus, closing the popup or forcing an earlier request's response into view. Only the latest committed query may replace the results and count; treat earlier responses as stale [[68]](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/e3d624baaf29dc1fc645aff3e38f03e564d2d6b1/README.md).

Validation should help correct a query rather than punish input. For an unsupported format, preserve the typed value and state the exact correction. For a numeric filter, allow typing and pasting, then parse the value and give inline guidance instead of blocking keystrokes. Define empty-search behavior, any minimum length and unsupported syntax deterministically. Do not suppress Enter aggressively, interrupt composition or announce a loud error on every keystroke.

### Listing composition and complete states

The top band of a listing should contain the query or category heading, an accurate result count, sorting, the filter trigger or rail, and applied-filter chips. A persistent filter rail can be useful on a wide screen. On a narrow screen, adjacent controls explicitly labeled "Filter" and "Sort" keep both operations discoverable. Choose a grid or list according to content pressure, not a device name. Responsive composition must preserve the same task and state [[23]](https://m3.material.io/foundations/layout/applying-layout/window-size-classes).

If old results remain visible during refresh, do not label them as results for the new query. Show the refreshing state near the changed query or filter. Only the latest response may update the list, count and pagination. Skeletons should reserve the real image and card geometry. Match their major blocks to the expected media ratio and text rows rather than representing every small control; this reserves space without claiming precision the content cannot support [[3]](https://web.dev/articles/optimize-cls). Keeping still-valid results visible is preferable to flashing the entire listing blank during a filter refresh .

A zero-result state should keep the query and active filters visible. Provide individual chip removal and a clear route to remove all filters. Distinguish this state from a first-use empty collection, because they have different causes and recovery actions. Place a loading or error message at the scope that failed, preserve the query, filters and feasible scroll context, and give a direct next step. A retry needs pressed and loading feedback and must prevent ambiguous repeated activation .

After a user visits a detail view and returns, restore the query, filters, sort order, loaded page or incrementally loaded extent, and a feasible approximation of the prior scroll position. The interface should preserve this working context rather than require the user to reconstruct it.

Communicate a large collection through an accurate count and pagination or incremental loading; loading every item at once is unnecessary. Never assign different identifiers to duplicated titles and images merely to create an impression of variety. A curated row should provide a clear route to the broader listing from which it was drawn.

### Make exploration state readable

Compose the listing control band as a readable statement of current scope: heading or query first, applied filters next, and sort as a separate peer. A selected-filter count on the filter trigger is supplementary. Do not represent an illustrative result count as an approved or complete collection size.

Applied chips are controls, not a decorative recap. Each chip must remove exactly one filter, expose a full accessible name such as "Remove blue filter," and preserve the query, remaining filters and sort after removal. When there are no active filters, do not render an empty chip tray or an unnecessary selected "All" chip. The category or query already communicates the unfiltered scope. With one active filter, avoid shouting the same selection through both an oversized trigger treatment and a chip.

When many filters are active, chips may wrap into readable rows. A summary such as "More filters" can follow the first line, but every hidden selection must remain discoverable through a count, an accessible summary and a clear-all route. Never force a long label into fixed-height clipping. If an applied facet becomes invalid, do not silently remove it. Keep its chip visible, explain the zero-result or invalid state, and provide a removal route.

Treat sorting as part of exploration, not as promotional content. Avoid an opaque default such as "Recommended" unless a deterministic rule supports it. Clear deterministic labels such as name, date or numeric order are preferable when those are the actual supported choices. Changing sort must preserve filter selections and result-set membership; it changes only order. Co-locating decision context reduces unnecessary movement between views [[72]](https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/reference/critique.md).

After a mobile filter sheet applies changes, close the sheet, show the selected count on its trigger, and present active chips in the compact page as well as in wide layouts. Quick actions revealed on pointer hover are enhancements only. Expose the same actions on keyboard focus and provide either a persistent labeled row or an explicit overflow control on touch. A consistent listing rhythm is useful, but a large promotional block must not push current scope and the first results below the initial discovery area [[66]](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/macrostructures/11-catalogue.md) [[67]](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/anti-patterns.md).

### Links, buttons and card interaction

Use a meaningful anchor or link for an element that leads to a new URL or document location. Use a button for an element that changes current state, opens a menu, saves an item or clears a query. Item images and titles, category destinations, pagination destinations and routes to a complete listing are links, so normal browser behavior such as opening in a new tab, copying a link, middle-clicking and recognizing a visited destination should survive. Save, compare, quantity change, clear and suggestion disclosure are buttons.

Do not mix these grammars through clickable `div` elements, a button that contains an entire card or script-only navigation. A card can have one primary item link and separate save or compare buttons. Avoid nested interactive targets, and do not stretch an invisible full-card link across secondary controls [[68]](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/e3d624baaf29dc1fc645aff3e38f03e564d2d6b1/README.md) [[69]](https://raw.githubusercontent.com/addyosmani/web-quality-skills/main/skills/accessibility/SKILL.md).

Destination links need a persistent recognizable affordance and visible focus without relying on animation. A restrained change in underline thickness or offset may provide optional polish, but text sliding, cursor-following effects and hover-only recognition are unnecessary.

## 12. Filters, sorting and comparison

### Context-aware filters

Filter groups should use the language of the current decision. Common facets might include source, status, range or rating, while size, material, compatibility, capacity, storage and dimensions apply only where the content supports them. Do not force the same generic facets onto every category. Put high-value groups first and place rarer groups in labeled disclosures. An active selection must remain visible in the applied-filter summary even when its group is collapsed.

Checkboxes are clear for multi-select. Pair a color swatch with its text name, a range slider with direct numeric entry, and drag interaction with a single-pointer alternative [[5]](https://www.w3.org/TR/WCAG22/). Counts must remain consistent with the selected combination. Explain why an option is disabled when the reason matters. Do not unpredictably mix selectable zero-count dead ends, disabled choices and choices that simply disappear. Selected filters need at least two cues drawn from color, border or indicator, icon or check, type weight and text, so selection does not depend on color alone .

On a wide screen, results can update immediately if focus and position remain stable. A mobile sheet can hold draft selections and provide a labeled action to show results. Decide whether closing the sheet discards or retains a draft, then apply that behavior consistently. The filter trigger should show the selected count. Active chips must wrap rather than clip, and every remove button needs a full accessible name.

Sorting is single-choice. Keep the current value visible in its trigger. A wide layout may use a menu and a narrow layout a short sheet, but both must preserve the same selected option. A sort change must not reset the count or filters. Labels such as "Relevant" or "Recommended" require deterministic supporting logic and must not imply paid placement or personalized prediction when neither exists.

### Honest overflow

Use an overflow fade or directional cue only when more filter choices actually lie beyond the visible region, not as decoration on every panel. At the start, the cue toward the start should be absent. At the end, the cue toward the end should be absent. If all content fits, both should be absent. Reserved edge gutters can keep the cue from masking content or focus. Suppressing cues while keyboard focus is within the region is a conservative option.

Native scrolling, optional labeled scroll controls and honest disabled states must remain usable without the visual effect. Directional cues observed outside content and focus may be useful, but that observation does not establish that they work for horizontal comparison tables. Review the chosen treatment under resizing, zoom, dynamic option counts, long labels and reduced-motion settings.

### Persistent comparison selection

When content is specification-driven, make comparison entry discoverable on each list item. Do not hide the only selection control behind hover. A persistent selection summary should show names or thumbnails, per-item remove controls and a route to the comparison view [[24]](https://baymard.com/blog/provide-comparison-features). Enforce compatible families where comparison depends on shared attributes. If an item is incompatible, explain why and provide a recovery path.

Do not show an empty comparison tray. With one selected item, identify it, ask for another compatible selection and provide a route back to browsing. There is no universal maximum number of selected items; readability of the available composition and task policy should determine a limit. If that limit is reached, never silently replace the oldest selection. Long names may wrap or shorten visually in compact headers, but model or option distinctions must remain visible and the full accessible name must remain available.

A same-browser comparison selection can persist locally, but its presentation must not imply permanent storage or account synchronization.

### Comparison table composition

In a wide comparison table, place item identity, selected option and the primary numeric attribute near the top. Align attributes by row and normalize units. Keep the first column or row-label column sticky when the table scrolls, and keep item headers visible or repeat identity context so users do not lose which value belongs to which item. A "Differences only" control must announce its current state.

Comparison exists to expose meaningful contrast, not to maximize row count. Each compact item summary should include an exact image or representation, option, concise name, key numeric attribute, availability and remove control where those fields apply. Order the following rows by the attributes that drive decisions in the current content category. Remove marketing prose, identical boilerplate and repeated unsupported quality claims; they lengthen the table without improving comparison.

Use a structure such as the following, with neutral fields selected from the actual content:

| Attribute | Item A | Item B |
|---|---|---|
| Capacity | Value with normalized unit | Value with normalized unit |
| Material | Recorded value | Recorded value |
| Configuration | Selected option | Selected option |
| Key numeric attribute | Formatted value | Formatted value |
| Availability | Current state | Information unavailable |

The differences-only mode may hide identical rows, but its hidden count must be based only on genuinely normalized matches. Equivalent measurements written in different units must be normalized before they are highlighted as different. Missing information is neither zero nor "same." Use an explicit label such as "Information unavailable" rather than an ambiguous dash.

Do not automatically remove an unavailable item from comparison, because availability can itself be a meaningful difference. Do not, however, expose an action that cannot be completed for that item. Highlight only decision-relevant differences with restrained emphasis. Do not color every row as a contest or invent an overall winner. Equal column widths and aligned rows support factual comparison; arbitrary tile prominence disrupts it [[65]](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/components/f6-product-card-grid.md).

### Comparison on narrow screens

Do not delete comparison on mobile. Choose among these compositions according to available width and content:

- Paired item columns with a sticky first column for row labels, keeping two items clearly aligned at a time.
- Stacked item summaries followed by shared attribute rows, with every value explicitly associated with its item name.
- A labeled, horizontally scrollable comparison region whose scrolling stays inside the table rather than moving the entire page.

A horizontal region needs an accessible name and a visible overflow cue. As keyboard focus moves, bring the focused cell into view. Keep the item header and row-label context available after scrolling. Avoid general page-level horizontal scrolling under text zoom or reflow. Genuinely two-dimensional content such as a comparison table may scroll within its own labeled region [[5]](https://www.w3.org/TR/WCAG22/).

If a desktop table compresses into one-character columns, replace it with paired columns, a sticky label column, stacked content or a labeled inner scroll region. If the item header scrolls away, make identity context sticky or repeat it. Validate the result with long labels, missing values, normalized units and keyboard navigation.

## 13. Summaries, multi-step flows and irreversible actions

### A running summary is a reconciled state

A pending-selection summary must be functional rather than a static representation. Add, value or quantity change, option-aware line editing, remove, move to a saved collection and Undo must update the underlying state. A navigation badge, line items, adjustments and shared total must all show one reconciled snapshot. Motion or a toast never substitutes for the mutation itself.

Use this reading order for each line:

1. Contained thumbnail or representation and item title.
2. Labeled values for selected options.
3. Source, provider or condition, when relevant.
4. Unit value, quantity and line total.
5. The effect of any applicable adjustment or rule.
6. Save, move or remove actions.

On a wide screen, these fields can align in columns. On a narrow screen, reflow them into scan bands: representation and identity first, numeric value and quantity next, then provider, adjustment and actions where present. The title and chosen option must precede the arithmetic they affect. Do not fix line height under text resizing. Action labels must be able to wrap or stack. If the representation squeezes the title or controls, reduce the media area rather than shrinking the text.

Treat every line as one reconciled record rather than a collage of independent labels. Keep amount columns stable and visibly associated with their lines. Long item, option and provider labels must wrap. Unit value multiplied by quantity, line adjustments and the shared total must come from one calculation path. Do not leave line and summary values looking final while they represent different snapshots.

### Quantity, value editing and pending arithmetic

A labeled stepper with decrease, current value and increase controls is a strong default for quantity. When high values are relevant, an editable numeric field can supplement it. Do not depend on a long dropdown or a separate Update action. As soon as a quantity change registers, update both line total and shared total. Usability testing has found manually submitted and blur-dependent updates to be a source of missed changes [[25]](https://baymard.com/blog/auto-update-users-quantity-changes).

Define what decrease at the minimum value does. It can become a labeled Remove action or invoke an explicit removal state. Treat a typed quantity of `0` as removal intent: remove the line, update the badge and total, and offer nearby Undo that restores the exact item, option and quantity [[25]](https://baymard.com/blog/auto-update-users-quantity-changes). Do not ambiguously reset it to `1`.

While a calculation is pending, handle duplicate changes, keep the selected intent visible and never mix old and new values in the total. A status such as "Updating" must not leave a stale total styled as final. On failure, restore the previous coherent state or explain how to correct the edit. Undo must reverse only the removal it names, not unrelated edits made afterward.

The same reconciliation rule applies to editable values other than quantity. Parse and validate the committed value, preserve it while correction is possible, identify which totals or dependent fields are pending, and update all derived displays atomically.

### Summary layout and state coverage

A summary should separate component values, adjustments and the final total through alignment and typographic hierarchy. Labels and values must remain associated under wrapping and text resize. Clearly distinguish estimated, provisional and final amounts. If data is illustrative or incomplete, label that limitation at the value's scope rather than presenting the number as an approved commitment.

Design beyond the populated state:

- **Zero lines:** Provide a concise explanation and a route to browse or visit saved items. Do not show a zero-valued summary card or a disabled commitment action.
- **One line:** Preserve the full line anatomy. Do not enlarge the summary into an oversized funnel merely because space is available.
- **Many lines:** Prefer readable row separators, repeated line controls and one shared summary over decorative nested cards by source or category.
- **Unavailable line:** Preserve identity and selected options, explain unavailability, disable only the operation that cannot proceed, keep Remove or Save available, and visibly reconcile the total policy.
- **Long label:** Stack the action on the next line. Never float a remove icon over the title where it can overlap.
- **Removed line:** Put an Undo near the change, naming the exact title, option and quantity. It must not reverse the next unrelated edit.

Moving an item to a saved collection should remove it from the pending set and visibly update the saved collection. If saving fails, do not lose the original line. For a reversible removal, a modal on every attempt creates unnecessary interruption. Optimistic removal with a time-bounded Undo can be useful, but the exact duration is a contextual choice. Source guidance prefers Undo to a confirmation dialog for reversible deletion; the important outcome is the object-level state change, not a toast [[67]](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/anti-patterns.md).

An empty pending set is a legitimate state. Keep it compact and task-oriented, without urgency, celebration or imagery that implies successful completion. If state persists only in the current browser, describe it as same-browser memory rather than promising account storage, cloud synchronization or permanence.

### Review and confirmation in multi-step flows

Use a running summary throughout a multi-step flow when earlier choices affect later values, eligibility or commitment. Derive the final review from the same source of truth as the editable steps rather than maintaining a duplicate manual record. The review should show selected items, options, quantities or values, applicable rules, sources or providers when relevant, adjustments and totals. Give users direct routes back to the appropriate editing step while preserving choices from the other steps.

At each step, place the primary forward action after the fields and information required to make that decision. In wide layouts, a persistent summary may sit beside the step content. On narrow layouts, place a compact summary before the primary action or expose it through a clearly labeled disclosure without hiding critical terms. Repetition of the final action can be appropriate only when each instance has the same effect and the surrounding context remains clear. Do not place a primary action where a sticky layer obscures the last field, validation message or summary row.

The final review must distinguish editable information from fixed information, and the final action must name the actual consequence. A review-and-confirm step is not a decorative recap: it is the last point for detecting option, quantity, provider, adjustment and arithmetic errors. Pending calculations must settle into one coherent snapshot before an irreversible commitment can be offered.

### Reversible removal and irreversible commitment

Match protection to reversibility. Low-risk removal from a local or pending set can update immediately with a specific, nearby Undo. An irreversible or high-consequence action requires stronger friction: state what will happen, identify the affected scope, use a consequence-specific action label, and provide a clear cancel or return path. Do not use generic success language for an edit or removal, and do not describe an intermediate state as completed.

Unavailable actions require capability honesty. If the product cannot complete an operation, omit the action and explain the boundary where users would otherwise expect it. A permanently disabled primary button is not an adequate substitute for that explanation, and an enabled control must never lead to fake success. Do not collect sensitive or commitment-related information, expose a hidden submit mechanism, create a record, or show a completion state when the corresponding capability does not exist.

A read-only preview can be valid when clearly labeled as such. Its contents must be derived from the current selection, not duplicated manually. It should provide routes to edit the selection and return to the preceding task. It must not imitate an actionable final step or suggest that a commitment has occurred.

When an operation is temporarily unavailable but genuinely supported, distinguish that state from a missing capability. Preserve readable contrast, remove misleading hover and pressed responses, and state the reason nearby. If the user can resolve the condition, an enabled action followed by clear validation may be more informative than a disabled control. If the operation is impossible in the current product, absence plus a direct explanation is more honest than a disabled promise.

Arithmetic inconsistency is a state failure, not a cosmetic defect. A quantity or value change that updates a line but not the shared total must be reconciled as one transaction, with the pending scope visible. A removal confirmation should name the removed object and offer Undo when reversal is available. The final primary action should describe only an operation the interface can actually perform.

## 14. Responsive composition and mobile robustness

### Change composition in response to content pressure

Treat desktop, tablet and mobile layouts as different compositions of the same experience, not as fixed screenshots or progressively smaller versions of one design. Change the layout when search becomes compressed, a filter rail leaves too little room for results, card facts wrap awkwardly, or parallel media and summary regions become weak. Available space changes with split-screen use, orientation and foldable states, so window size and content pressure are more reliable inputs than device detection [[23]](https://m3.material.io/foundations/layout/applying-layout/window-size-classes).

In a wide view, search can be the primary header anchor, category or section navigation can occupy a separate row, a listing can place a filter rail beside its results, and a detail view can use parallel media and summary columns. As space decreases, utilities can become more compact, but core discovery controls must remain available. In a narrow view, the top row can contain identity, menu access and essential utilities while search receives its own readable row. Listings should become a single content column. Clearly labelled filter and sort triggers can open a sheet or drawer. A detail view should reflow into a meaningful vertical sequence.

Window-size classes are composition aids, not device categories. Material's illustrative ranges are compact below 600 dp, medium from 600 to 839 dp, expanded from 840 to 1199 dp, large from 1200 to 1599 dp, and extra-large at 1600 dp or above. These values belong to that design system and are not proven universal web breakpoints. Do not transplant native-oriented dp values directly as CSS pixel breakpoints [[23]](https://m3.material.io/foundations/layout/applying-layout/window-size-classes). Determine actual transitions by testing real labels, formatted numbers, long titles, browser zoom and available width. When a breakpoint changes a component's form, preserve entered queries, selected filters, the active content section, scroll context and focus context.

Responsive changes should preserve purpose even when they change surface. A persistent wide filter rail and a compact modal filter drawer can share the same selection state. A wide navigation panel can become a drawer with a limited amount of hierarchy, a distinct Back action and a distinct Close action. A short sort menu can become a bottom sheet. Destinations, current state and the next available action should remain equivalent across these changes.

Sticky regions require their own content-pressure test. A wide summary may remain sticky only when it does not cover important content or focused controls. A compact sticky action region must account for browser controls and safe areas, and must not cover an option error, notification or focused control. Stacking a promotional strip, header, tabs and action bar can leave too little usable content height even when each region is individually reasonable. If sticky regions hide or squeeze the task, reduce or remove stickiness rather than treating it as an invariant.

### Reflow, resize and long copy

A page should not require horizontal scrolling at a narrow width. The WCAG 2.2 AA reflow reference for vertically scrolling content is presentation at a width equivalent to 320 CSS pixels without loss of information or functionality. Genuinely two-dimensional content can be an exception [[5]](https://www.w3.org/TR/WCAG22/). In visual terms, header actions should wrap or regroup, cards should form a readable single column, chips should wrap when needed, and a breadcrumb should become a compact path. A truly two-dimensional comparison region can have its own labelled horizontal scrolling container, but it must not make the entire page drift sideways.

Text resize and user spacing overrides are normal stress conditions. Fixed-height chips, buttons, tabs and title regions must not crop long labels. WCAG's text-spacing test values are line height of at least 1.5 times the font size, spacing after paragraphs of at least 2 times the font size, letter spacing of at least 0.12 times the font size, and word spacing of at least 0.16 times the font size. These are conformance test values, not a prescription for authored default typography [[5]](https://www.w3.org/TR/WCAG22/). Content and actions must remain available when a user applies them.

Test labels that are substantially longer than their default wording, controls such as change-location and clear-all actions, and locale-formatted values with grouping separators. Keep a currency symbol, sign or unit with the number it qualifies rather than orphaning it on another line. Do not hard-code a control width from one language or a short placeholder. Preserve the order of key metadata when a title grows from one line to two or more.

Related short fields can appear side by side in a wide composition and stack in a narrow one. Their heading, source order and labels must preserve the relationship after stacking. Zoom must remain available. Reflow is not satisfied by shrinking text or controls until they technically fit.

### Safe areas, browser controls and the software keyboard

A clean rectangular mobile mockup does not represent a real browser viewport. Address bars, bottom toolbars, rounded corners, display cutouts and software keyboards alter the usable region. Full-bleed media may extend to the physical edge, but the inner content of Close buttons, carousel controls, filter actions and sticky controls must stay within a safe region. Safe-area environment values can express these insets and can include fallback values [[26]](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env).

Do not make these APIs a baseline requirement. When safe-area or keyboard insets are available, use them to refine presentation. When they are absent, natural document flow, ordinary padding, constrained overlay height and a clear inner scrolling region must remain usable. Keyboard inset values are defined through the VirtualKeyboard API, but browsers do not all resize, pan or overlay the viewport in the same way [[26]](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env). Large viewport units can allow browser controls to cover content while those controls are visible [[27]](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length). No single viewport unit is a universal answer.

Choose a height strategy from the behavior of the content. Natural page scrolling is generally the most resilient starting point. When a drawer or dialog must be viewport-bound, constrain it to the available height, make its content region scrollable, include safe-area spacing, and inspect it with the keyboard open. Dynamic viewport units can react to changing browser controls, but that reaction can also move geometry. Support for small, large and dynamic viewport units, legacy viewport units, visual viewport behavior and keyboard insets must be verified against the intended browser matrix rather than inferred from a screenshot [[27]](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length) [[26]](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env).

When an autocomplete field, filter field or dialog input receives focus, both the input and its associated message must remain reachable above the keyboard. Scroll ownership must be unambiguous: the page and an inner sheet should not compete to respond to the same gesture. If keyboard navigation moves focus beneath a sticky header, bottom action region or notification, adjust the viewport enough to expose the focused control. WCAG 2.4.11 AA requires, at minimum, that author-created content not entirely obscure the focused component [[5]](https://www.w3.org/TR/WCAG22/). Stronger interface guidance keeps its label, error and immediate context visible as well.

### Touch, mouse and hybrid input

Hover is a capability, not a device identity. A large navigation panel can use hover as an aid, but click and keyboard input must provide deterministic open and close behavior, while touch requires an explicit disclosure control. Hybrid computers can expose both touch and hover. Core facts and controls must never require hover.

For hover-open navigation, a 300 to 500 ms opening delay is published as a contextual starting range for reducing accidental flicker, not as a universal timing law. Closing delay, a forgiving pointer corridor and stable active-trigger behavior should also be tested against the actual geometry. Pointer-corridor logic remains an implementation hypothesis rather than a directly verified rule [[35]](https://baymard.com/blog/dropdown-menu-flickering-issue). Escape should close the surface, keyboard focus should be able to enter it, and touch should receive a predictable explicit action.

The WCAG 2.2 AA pointer-target floor is 24 by 24 CSS pixels, with spacing, equivalent-control, inline, user-agent and essential-presentation exceptions [[5]](https://www.w3.org/TR/WCAG22/). This is not an ideal for comfortable touch interaction. **A target near 44 CSS pixels is a useful illustrative product guideline**, especially for Close, filter, stepper, thumbnail and carousel controls. Dense inline links and the standard exceptions require separate review. Choose actual target dimensions according to label length, reach and error risk.

Provide a tap, button or text alternative for a drag-operated gallery, carousel or range control. WCAG requires a single-pointer, non-dragging path when dragging is not essential [[5]](https://www.w3.org/TR/WCAG22/). Extended hit areas must not overlap neighboring controls, and decorative layers must not intercept activation.

### Focus and scroll ownership are part of responsive layout

After responsive recomposition, focus must still represent the same logical object. When a wide filter rail becomes a compact drawer, do not send the currently focused filter to the start of the document without reason. Opening the drawer should move focus predictably to its title or first relevant control, and closing it should return focus to the filter trigger. If an open surface becomes invalid at a breakpoint, close it in an orderly way and restore the trigger or nearest logical context. Preserve entered and selected state.

Focus order must agree with visual reading order. Do not use CSS reordering to create a keyboard path that zigzags through the interface. Do not patch order with positive `tabindex`; prefer natural document order and the appropriate roving-focus pattern for composite widgets [[70]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-accessibility/SKILL.md) [[71]](https://raw.githubusercontent.com/PrototyperAI/prototyper-ui/main/apps/docs/skill/build-primitive/SKILL.md).

At any moment, make clear which region is expected to scroll: the page, a horizontal rail, a comparison region, a drawer or an autocomplete list. When a modal drawer is open, make the background inert and contain accidental scroll chaining at the inner boundary when necessary. A non-modal popover should not freeze the page. The software keyboard, sticky header, sticky bottom region and notifications must not cover the focused control.

Allow the browser to reveal focus first. Apply measured scrolling only when an author-created layer still hides the control or its context. Snapping the page to the top or center on every focus event takes scroll ownership away from the user. Scroll margin can account for sticky controls when revealing an anchored heading or focused item [[68]](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/e3d624baaf29dc1fc645aff3e38f03e564d2d6b1/README.md) [[69]](https://raw.githubusercontent.com/addyosmani/web-quality-skills/main/skills/accessibility/SKILL.md).

### Keep scroll affordances truthful

Make a horizontal rail, thumbnail strip or comparison region clipped and scrollable only when its content actually overflows. A partial next item, clipped edge, labelled arrows, position cue or restrained edge mask can signal continuation. A next-item peek of 16 to 32 px is a contextual example from an archived playbook, not a universal measurement. Tune it to card width, gutter and viewport [[73]](https://www.ui-skills.com/playbook/peek-the-next-scroll-item).

A fade or mask is optional and cannot replace a scrollbar or controls. It must not make text or controls unreadable. Update it at the start and end of the region, let it degrade safely in forced-colors and reduced-transparency conditions, and keep all content reachable [[74]](https://www.ui-skills.com/playbook/fade-scroll-edges).

Do not globally hide a useful scrollbar for visual cleanliness. If a custom scrollbar is necessary, test the thumb-to-track relationship, contrast, hit behavior and platform expectations. Fix the underlying overflow when a scrollbar is unintended. When keyboard focus reaches an off-screen item in a rail, reveal that item within its region rather than shifting the entire page sideways. At the start or end, the visual and programmatic unavailable states of navigation arrows must agree.

A truncated title is not a scroll affordance. Use clamping only to support compact scanning, and make the complete distinguishing value available in a detail view, an accessible link name or deliberate expansion. A hover tooltip cannot be the only way to obtain the complete title [[68]](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/e3d624baaf29dc1fc645aff3e38f03e564d2d6b1/README.md) [[75]](https://www.ui-skills.com/playbook/clamp-overflowing-titles).

## 15. Overlays, tabs and accordions

### Choose a surface by its role

Dialogs, drawers, bottom sheets, popovers and full-screen layers are not merely different sizes of the same rounded rectangle. A dialog supports a short focused decision or compact subtask. A drawer gives side-oriented context to navigation or a long filter hierarchy. A bottom sheet can suit a short set of choices in a compact window, such as sorting. Dozens of filter values or keyboard-heavy content may require a near-full-height drawer or sheet instead. Material presents bottom sheets as a compact-window convention, but content length and focus travel can override that convention [[28]](https://m3.material.io/components/bottom-sheets/overview?hl=en).

Every modal surface needs a visible title, a clear Close action, one primary scrolling region and stable action placement. Backdrop activation must not be the only exit. Background interaction must be inactive. Initial focus should move to the title, first useful field or a suitable action according to the task. After Close or Escape, return focus to the relevant opening trigger.

When both the top bar and bottom action region are sticky, visibly bound the list between them and keep the final option from becoming trapped behind an action. A focused row must not be entirely hidden by either sticky layer. Destructive and non-destructive actions need clear wording and clear spatial distinction.

A filter drawer should distinguish draft state from applied state. Decide whether the trigger count updates immediately or only after Apply, and do not mix the models. Make it clear whether closing discards or retains a draft. After Apply, restore context near the trigger and expose active selections.

A non-modal popover must be positioned and dismissed without hiding focused background content [[29]](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html). Collision handling can reposition the layer within the viewport, but it must not jump beneath focus and cover the current control, label or error.

### Tabs and accordions use different interaction grammars

Tabs represent a set of peer views. One tab is current and displays its associated tab panel. An accordion represents a stack of headings, each of which expands or collapses its own section. Tabs can recompose into an accordion at a narrow width, but stacking tab labels with CSS is not a semantic conversion. The keyboard and disclosure models remain different. The ARIA Authoring Practices Guide treats tabs as a dedicated pattern with specific roles, states and keyboard behavior [[30]](https://www.w3.org/WAI/ARIA/apg/patterns/tabs).

Related peer sections can appear as tabs in a wide detail view. If labels clip or an off-screen tab rail hides context, an accordion can be more readable in a compact view. During a breakpoint change, keep the section represented by the active tab expanded in the corresponding accordion. Preserve heading order, section deep links and visible focus while the composition changes.

Do not communicate tab selection through color alone. Combine label treatment with an indicator, border or shape cue. In an accordion, chevron direction is supplementary. The accessible name and expanded state must also communicate whether a section is open.

Preserve each pattern's established grammar. Arrow keys move among peers in a tab list, and the selected tab controls its panel. Each accordion heading is a button that exposes its own expanded state. Do not assign `alertdialog` to an ordinary dialog, tab semantics to a disclosure, or modal semantics to a decorative panel merely to obtain styling. Native platform semantics or a well-tested accessible primitive are safer starting points than a hand-built focus trap or keyboard model [[71]](https://raw.githubusercontent.com/PrototyperAI/prototyper-ui/main/apps/docs/skill/build-primitive/SKILL.md) [[76]](https://raw.githubusercontent.com/Dammyjay93/interface-design/main/.claude/skills/interface-design/SKILL.md).

### Autocomplete and gallery overlays

Search autocomplete should remain an editable combobox. Tab reaches the input, arrow keys explore suggestions, Enter accepts a suggestion, and Escape dismisses the popup. Do not capture platform editing keys in a way that damages cursor and text-editing behavior [[22]](https://www.w3.org/WAI/ARIA/apg/patterns/combobox). The visual active suggestion and programmatic active descendant must stay synchronized. Pointer hover, touch activation and keyboard highlighting must not silently overwrite one another.

On a compact screen, the suggestion list may use the available height, but the input and Close or Back context must remain visible. Keep the remaining list scrollable above the software keyboard and bottom browser controls so the final suggestion remains reachable.

A gallery lightbox should visibly provide the current image, a position cue such as "Image 2 of 5," Close, and previous and next controls. Swipe is a useful enhancement, not the only path. A thumbnail rail gives information scent and direct targeting for additional media; dots alone can make the subject of each image difficult to infer [[19]](https://baymard.com/blog/always-use-thumbnails-additional-images). Zoom, pinch and pan must not conflict with the gesture used to close the lightbox. Keep focus within the modal lightbox, then return it to the originating thumbnail or gallery trigger when the lightbox closes.

### Modal and non-modal state grammar

Visual size does not determine modality. **Use a modal dialog when the user should not operate the background before completing or dismissing a focused decision or subtask.** A genuinely consequential, irreversible removal can justify this pattern. Make the background inert, bound focus within the dialog, provide a visible title and description, and include explicit Close or Cancel actions. Escape should dismiss predictably when cancellation is safe.

Do not place initial focus blindly on a destructive primary action. Depending on context, the title, least-destructive action or first useful field can be safer. On Close, Cancel or successful completion, return focus to the opening trigger. If that trigger no longer exists, use the nearest logical successor [[70]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-accessibility/SKILL.md) [[71]](https://raw.githubusercontent.com/PrototyperAI/prototyper-ui/main/apps/docs/skill/build-primitive/SKILL.md).

A **non-modal** popover, autocomplete or help surface allows continued work with background context. Do not add a focus trap, page-wide inert state or global scroll lock. Expose the trigger's expanded state. Escape should close the layer while preserving the trigger and context. Click-outside dismissal can be a convenience, but it cannot be the only exit.

A drawer can be either modal or a persistent non-modal region. Choose semantics from the actual background-interaction contract, not from the component name [[68]](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/e3d624baaf29dc1fc645aff3e38f03e564d2d6b1/README.md).

### Tooltips provide supplementary help

A tooltip must not be the only discoverable source of a required fact, unavailable-state reason, field error, confirmation, keyboard shortcut or touch label. Put essential explanation inline. Give every icon-only control an accessible name that does not depend on a tooltip.

Make a tooltip available on both hover and keyboard focus. If a pointer can move from its trigger into the tooltip, do not dismiss it prematurely. Escape should dismiss it, and its placement must not cover the trigger. If the content needs a button or link, use a focusable popover or help surface rather than the tooltip pattern [[68]](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/e3d624baaf29dc1fc645aff3e38f03e564d2d6b1/README.md).

In a grouped toolbar, the first tooltip may appear after a short intent delay and nearby peers may appear faster. This is optional polish, not mandatory timing. Do not delay so long that a keyboard user cannot obtain the label, and avoid instant hover flicker. Allow reasonable exit grace after pointer or focus leaves. A stale tooltip must not show the previous trigger's label. On touch, prefer visible labels, expandable help or a labelled action over long-press guesswork [[77]](https://www.ui-skills.com/playbook/warm-toolbar-tooltips).

The availability of a tooltip pattern does not create a need for one. Omit it when an inline fact or labelled disclosure is clearer. If a later surface has a genuine tooltip need, evaluate keyboard focus, Escape dismissal, a touch alternative, an independent accessible name and collision-safe placement. Judge an accordion's disclosure behavior separately from decorative bounce or other animation.

### Backdrops communicate but do not implement modality

Backdrop treatment is a visual-system choice, and blur is not categorically prohibited. A solid or translucent scrim is a dependable option for rendering cost and foreground separation. If blur is used, test performance, leakage of readable background text and contrast [[78]](https://www.ui-skills.com/playbook/use-solid-modal-scrims).

A scrim can communicate modal status, but it does not replace focus management or an inert background. Likewise, a large panel is not modal unless its interaction contract makes the background unavailable.

## 16. Component states and visible feedback

### Give every state a distinct meaning

Do not merge default, hover, focus-visible, active or pressed, selected, disabled, loading, error, success and read-only into one generic highlight family. Hover signals that interaction is available. Focus-visible identifies keyboard location. Active or pressed is brief feedback during current contact or activation. Selected is a persistent choice. Disabled means an interaction is genuinely unavailable. Loading means an accepted action has a pending result. Error identifies a failure and its recovery scope. Success confirms a completed result. Read-only preserves access to a value while withholding editing.

One state must not erase another. A selected chip with keyboard focus must retain both its selected marker and its focus outline. A focused selected radio must show both selection and focus. A loading button must retain its action identity. An error should not disappear until the error is actually cleared.

| State | Visible signal | Interaction meaning |
|---|---|---|
| Default | Stable label, boundary and affordance appropriate to the surface | Available at rest, with no transient interaction |
| Hover | Restrained surface, border or emphasis change without exposing essential hidden content | Pointer is over an available target |
| Focus-visible | Strong outer outline or equivalent cue that survives mixed surfaces and imagery | Keyboard focus is at this target |
| Active or pressed | Immediate surface or shape response with no layout jump | Pointer, touch or key activation is currently in progress |
| Selected | Persistent marker plus text, border, shape or surface difference | A choice or current peer remains selected |
| Disabled | Readable unavailable treatment plus a nearby reason when useful | The interaction is genuinely unavailable |
| Loading | Stable label area plus a local progress cue | The action was accepted and its result is pending |
| Error | Field or region cue, specific message and recovery action | The operation or value failed within the stated scope |
| Success | Changed object or region plus concise confirmation | The operation completed and the resulting state is available |
| Read-only | Normal readable value with editing affordance removed or clearly unavailable | The value can be read and selected but not edited |

Color alone is not proof of state. A selected chip can retain a border or check. A current thumbnail can use an outline and position cue. An invalid input needs both a field cue and a text message. Focus indicators must remain visible over mixed surfaces and media and must not be clipped by a rounded container's overflow.

Do not make a disabled control merely faint. If the user can correct the condition, an enabled action followed by clear validation is often more informative. If an option is genuinely unavailable, keep its label readable and place a reason nearby.

### Loading without invented waiting

Show pressed feedback as soon as an interaction is accepted. Show loading only for a real pending state. Do not add an artificial spinner, staged percentage or fixed delay for polish. A short synchronous change can proceed directly to the selected or saved result. During a real refresh, keep existing valid content visible when it remains coherent and place local progress near the affected heading or trigger.

Loading must not change a component's size. When an indicator appears, retain the action identity in the accessible name. A skeleton can represent predictable card or row geometry, but turning every icon into a shimmering placeholder creates visual noise. Match the final media ratio and major rows approximately, and reserve space for asynchronous content to reduce layout shift [[3]](https://web.dev/articles/optimize-cls).

In reduced-motion conditions, replace shimmer with a static or quiet treatment while retaining pending status. More generally, loading labels, active positions, selected state, result counts and errors must remain understandable without animation [[34]](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion).

### Empty, error and success feedback

Distinguish an empty collection from a zero-result query. An empty collection can offer a route to continue discovery or creation. A zero-result query should preserve the query and selected filters while offering a clear reset or revision action. Do not let an oversized illustration push the recovery action below the useful part of an empty state.

Place an error where the failure occurred: a field error beside its field, a section error inside its section, and a page-level error only when the page as a whole cannot remain useful. Name a network cause only when the system actually knows that the network caused the failure. For an unknown cause, state that the content could not load and offer Retry rather than guessing. Preserve the query, selected state and scroll context.

Retry must show both pressed and real loading feedback. Prevent repeated activation from creating an ambiguous duplicate operation. State the known failure scope and the next step. A retry should be idempotent where the operation permits it, and it should preserve or restore the previous coherent state.

Show confirmation near the object that changed. Change the object's saved or selected state and provide a short success cue. A generic green notification must not be the only evidence. If a toast is used, avoid duplicate stacks, do not move keyboard focus to it when no action is required, and do not let it cover sticky controls or focused content. An interface must not claim completion for a capability or transaction that it does not actually perform.

### Forced colors must preserve behavioral truth

Forced-colors mode can replace authored colors, remove shadows and remove non-URL background images [[31]](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors). Therefore, a shadow-only card edge, gradient-only selection and glow-only focus indicator do not fail safely.

Prefer native button, link and input semantics. Browsers choose system colors from native element context, not merely from an added ARIA role [[31]](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors). Borders, outlines, labels and markers must preserve hierarchy when shadows disappear. Pair a color swatch with a readable name and selected marker. Preserve status meaning through text or icon shape in addition to hue.

Do not broadly opt out with `forced-color-adjust`. A narrowly protected meaning-bearing swatch still needs an independent adjacent label and state. Treat forced colors as a case for targeted usability and legibility repairs, not a separate redesign [[31]](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors).

### Preserve native control meaning and selection grammar

A control's appearance may change, but its meaning must not. A standard button performs a one-time action. A toggle button turns the same action-state on or off and exposes its pressed state. A checkbox represents an independent or multi-select choice, and a related checkbox group needs a visible legend or context. A radio group represents mutually exclusive options and makes the current selection clear. A switch represents an immediate binary setting, not a command.

Mutually exclusive view modes can be radio-like options, while saving an item is an action whose resulting saved state is announced separately. Start with a native input and clickable label. A custom visual shell must preserve native focus, keyboard input, accessible name, checked or indeterminate state, and disabled behavior [[71]](https://raw.githubusercontent.com/PrototyperAI/prototyper-ui/main/apps/docs/skill/build-primitive/SKILL.md) [[70]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-accessibility/SKILL.md).

Let a label and control share a generous, non-overlapping hit area. Do not leave a dead zone between a checkbox's small visual box and its text. The precise WCAG AA baseline and exceptions are covered in UI.md section 21; do not describe 44 px as a magical AA requirement. Choose dense desktop and comfortable touch targets according to context. Do not let extended hit areas overlap adjacent controls or let decoration consume clicks. The visible focus cue, selection marker and label must all survive on the final surface and in forced-colors mode [[70]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-accessibility/SKILL.md) [[79]](https://www.ui-skills.com/playbook/show-visible-focus-rings).

### Use at least two independent state channels

Keep persistent state truthful through both a visible form and readable or programmatic meaning. A saved icon can change fill or shape, but its label and exposed state must also update. A selected filter can use a check or border and expose selected text or state. An unavailable option can use a strike or icon and the text "Unavailable." Hue is supportive, not the sole grammar. Shape can also fail when an icon is unfamiliar or merges in forced colors, so combine it with nearby text, accessible state and consistent placement [[70]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-accessibility/SKILL.md).

Do not use the same highlight for hover, focus, pressed, selected and pending. Hover indicates possibility, focus identifies keyboard location, pressed acknowledges current activation, selected represents a retained choice, and pending represents an accepted but unfinished result. After an error, return a corrected field to its resting state only when the error has actually cleared.

An asynchronous screen-reader announcement must communicate the same fact as the visible result. Hide a decorative icon from duplicate announcement when appropriate. When state-transition animation is disabled, the final icon, text, border or marker must still carry the meaning [[68]](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/e3d624baaf29dc1fc645aff3e38f03e564d2d6b1/README.md) [[69]](https://raw.githubusercontent.com/addyosmani/web-quality-skills/main/skills/accessibility/SKILL.md).

### Field anatomy: instruction, format, validation and recovery

Keep a consistent field contract: visible label; optional or required status when relevant; a concise pre-entry hint; the input; then local status or error. A placeholder can illustrate an expected value, but it cannot replace persistent instruction. Explain the expected format before entry, including accepted separators or grouping where relevant, and normalize common spaces or grouping safely. Do not force users to guess a format through repeated correction.

Accept pasted values. Normalize leading and trailing whitespace safely. If formatting occurs after blur, avoid surprising changes to the caret or underlying value [[68]](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/e3d624baaf29dc1fc645aff3e38f03e564d2d6b1/README.md) [[80]](https://www.ui-skills.com/playbook/label-every-form-field).

Match validation timing to error risk. Do not show a red error for every temporarily incomplete character during typing. Show a stable message on blur or submission, as appropriate, and clear it promptly after correction. Do not disable a submission or action in advance merely to make the user guess why it is unavailable. Where safe, let activation reveal validation, then focus or reveal the first invalid field.

Place the error message beside the field, connect invalid state programmatically, preserve the entered value, and state both the problem and the correction. A specific minimum, maximum or format requirement is better than "Invalid." A top summary can help in a long form, but it does not replace inline messages. Announce routine inline updates politely. Reserve assertive interruption for an urgent failure that is not already tied to context [[81]](https://www.ui-skills.com/playbook/show-errors-beside-fields) [[69]](https://raw.githubusercontent.com/addyosmani/web-quality-skills/main/skills/accessibility/SKILL.md) [[70]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-accessibility/SKILL.md).

Browser autofill and paste compatibility reduce friction, but they do not justify collecting data that the interface does not need. Field guidance must stay within the product's actual capabilities and declared data practices.

### Disabled, pending, cancellation and repeated activation

`disabled` means genuinely unavailable, not "the interface does not want to explain an error." If a user can correct the condition, an enabled action with nearby instruction or validation is often clearer. A native disabled control leaves the focus order, so a tooltip-only explanation is unreachable to a keyboard user.

If a control must remain discoverable and focusable, `aria-disabled` can expose the state, but pointer, keyboard and form activation must all be blocked in behavior, and a readable inline reason must be present. A read-only value is not a disabled choice. Distinguish readable and selectable content with editing unavailable from an interaction that cannot currently be chosen [[70]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-accessibility/SKILL.md).

As soon as an action is accepted, provide pressed acknowledgement. During a real pending mutation, retain the original button label, add a progress cue, prevent duplicate activation and identify the affected scope. A local status such as "Saving this item" is clearer than a generic full-page spinner.

Offer Cancel only when the operation is genuinely interruptible. Do not claim cancellation after a result may already have committed. A pending search or filter must not present itself as a newly completed state. Name the known failure scope and next step, and do not invent a network explanation for an unknown failure [[68]](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/e3d624baaf29dc1fc645aff3e38f03e564d2d6b1/README.md).

An optimistic update can suit a low-risk local action that is likely to succeed. Show the changed state immediately, then roll it back with honest recovery if the operation fails. Do not leave related totals or dependent values in a mixture of old and new snapshots. The button label, spinner, status region, toast and changed object must represent one state machine. A visible success state must never conflict with an underlying unsuccessful result.

### Confirmation versus Undo

Choose between confirmation and Undo according to consequence, reversibility and recovery cost. An irreversible or high-impact action needs confirmation. Its dialog should name the exact object and consequence, give Cancel appropriate prominence, and label the destructive action specifically rather than using a generic "Yes" [[82]](https://www.ui-skills.com/playbook/confirm-destructive-actions).

Confirmation for every cheap, reversible edit increases friction and habituation. Removing a saved item, comparison entry or local row can happen immediately when a nearby Undo action restores the exact item, option and value within a limited but usable window [[68]](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/e3d624baaf29dc1fc645aff3e38f03e564d2d6b1/README.md).

An Undo notification should not automatically take focus. The changed location should also show the result. Sticky interface regions must not cover a keyboard-reachable Undo action, and dismissal should leave focus and context sensible. There is no arbitrary universal duration for the Undo window; determine it from reading time, motor response and consequence. When Undo expires, do not imply that restoration remains available. A bulk clear or state that is difficult to reconstruct can deserve confirmation even when it is technically reversible.

Do not design confirmation or success states for operations the product cannot actually complete. Visible feedback must describe real capability and real state.

### Tie animated feedback to local truth

An animated icon can provide a small optional response to a menu or disclosure changing state. Its label, visible content and exposed expanded state must agree immediately; brief movement cannot substitute for any of them. Validate that the chosen icon actually represents the local action rather than assuming that an available animation has the required meaning.

Use animated numbers only for a real changing count or editable numeric need. First ensure accurate values, boundaries for edits, resilience during rapid changes and accessible announcements. Do not use a fake countdown, stale digits, artificial urgency or success-like animation to conceal pending or error states. Native controls and plain numbers remain valid defaults.

## 17. Iconography, motion and interaction polish

### Treat an icon as a sign with a label and consequence

Keep stroke style, optical weight and baseline consistent across an icon family, but do not treat consistency as a substitute for recognition. Actions such as Filter, Sort, Compare and Remove need visible text. Back, Close and Search may be icon-only when the context is unambiguous and an accessible name is available. A tooltip is not a substitute for a label on a touch interface [[32]](https://www.nngroup.com/articles/icon-usability/).

Use one symbol for one meaning. Do not use the same heart for both saving and an unrelated approval action. An outline-to-filled transition can communicate selection, but retain a non-color cue in a label, indicator or surface treatment. Optically align icons with the text baseline. In a compact chip, do not enlarge the glyph until its label appears secondary.

### Use motion to explain state

Motion should confirm input, show spatial continuity, reveal hierarchy or direct measured attention to a changed state. Do not combine lift on every collection item, repeated entrance cascades, an automatically running banner and constant shimmer merely to make a surface appear polished. Animation can explain a mode change, but it can also seize attention [[33]](http://nngroup.com/articles/animation-purpose-ux).

Pressed feedback should be immediate. A result count, drawer layer and gallery direction must remain legible without animation, and revealing a state must not require waiting for an animation to finish. Motion should be interruptible. Movement based on transforms and opacity generally preserves visible stability better than position animation that moves neighboring content [[3]](https://web.dev/articles/optimize-cls).

Reduced motion does not mean removing feedback. Remove or quiet long travel, parallax, zoom, bounce, sweeping shimmer and decorative cascades. Preserve selected borders, icon changes, textual status and immediate visibility changes. Scaling motion can be problematic for some users, so the response to the system preference must be meaningful [[34]](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion). Do not suppress focus movement. Keep it predictable and visible.

### Design hover intent and direct manipulation

A hover state must not cause layout jumps. If a card gains elevation, neighboring geometry should remain stable. A critical action must still look actionable without hover. Immediate switching among sibling items in a large menu can cause flicker. A delay of 300 to 500 ms is a starting point, not a universal rule [[35]](https://baymard.com/blog/dropdown-menu-flickering-issue). Validate the final delay against menu geometry and perceived responsiveness. Click, Enter and touch paths must not depend on that delay.

Dragging or swiping should track direct manipulation instead of following the pointer or finger with ornamental lag. Range controls, galleries and carousels need parallel buttons, tap targets or fields when appropriate. Pointer capability may determine an enhancement, but touch and hover paths must remain coherent within one session on a hybrid device.

### Make motion geometry explain origin and destination

Do not make a popover, tooltip, dropdown or anchored menu appear to scale from the center of the viewport. Set its `transform-origin` near the edge or corner closest to the opening trigger. If placement flips, the origin should flip as well. This small geometric detail clarifies the relationship between trigger and surface. A centered modal is not anchored to an object, so a centered origin is valid.

Growing an entrance from zero scale can look abrupt and toy-like. When scale is useful, begin close to the final size and combine a small scale change with opacity. Percentage translation is relative to the moving element's own box, which can give a drawer or notification a path proportional to its actual size. Use fixed-pixel travel only when the visual distance should be intentionally capped. [[83]](https://raw.githubusercontent.com/emilkowalski/skills/main/skills/animate/SKILL.md) [[84]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/review-animations/STANDARDS.md)

Entrance and exit are two ends of the same semantic route. A drawer that enters from one edge should return to that edge when closed or reversed. When removing a row, avoid sending it an entire row height away. A short fixed travel with opacity, followed by layout settlement, prevents neighboring rows from attracting more attention than the action itself.

On entrance, make content readable early and let it settle gently. `ease-out` is a dependable starting choice for that reason. `ease-in` acceleration may feel natural for pure departure, but if the next state waits for the disappearing object, a shorter exit or a brisker `ease-out` may feel better. `ease-in-out` can support continuity when an object relocates or morphs while remaining on screen. None of these curves is an absolute rule. Evaluate a curve against travel, interruption and perceived waiting. [[85]](https://raw.githubusercontent.com/raphaelsalaja/skill/main/skills/12-principles-of-animation/SKILL.md) [[83]](https://raw.githubusercontent.com/emilkowalski/skills/main/skills/animate/SKILL.md) [[86]](https://raw.githubusercontent.com/jakubkrehel/make-interfaces-feel-better/main/skills/make-interfaces-feel-better/SKILL.md)

Treat opacity as a partner to movement, not a replacement for it. An entering object should not flash fully opaque at its destination in the first frame. An exiting object should not leave a ghost trail until its last frame. Travel distance should match hierarchy: a short path for a tooltip or popover, an edge-linked path for a drawer, and a mostly in-place crossfade for a changed icon. Timing bands are adjustable starting points rather than laws. Duration varies with distance, size, frequency, device and interruption. State and text must become usable before animation finishes. Motion must never gate reading.

### Keep pressed feedback geometrically honest

A press scale can provide a tactile cue, but the actual button box, focus outline and hit target must keep fixed geometry while the visible surface scales. Do not shrink DOM width, height or padding during a press. If a pseudo-element extends the hit area, it must not overlap a neighboring control's hit area. Pointer release should reliably complete on the same control after the press transform. A subtle scale such as `0.96` to `0.98` is often sufficient, but it is illustrative rather than universal. For compact remove, save or value-step controls, first provide an accessible name, fixed target and clear pressed or selected cue. [[48]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-ui/SKILL.md) [[86]](https://raw.githubusercontent.com/jakubkrehel/make-interfaces-feel-better/main/skills/make-interfaces-feel-better/SKILL.md)

Pointer press, keyboard activation and programmatic activation should produce the same outcome, but they need not copy the same movement. Frequently used controls activated from the keyboard may change state instantly, while touch or pointer input may receive a short depression. Add movement on `:hover` only where both hover and a fine pointer are available, because tap devices can produce false or sticky hover. Do not squeeze, clip or animate the focus ring with scale. When motion is disabled, selected fill, border, icon and status text must carry the truth of the action. [[83]](https://raw.githubusercontent.com/emilkowalski/skills/main/skills/animate/SKILL.md)

### Choose easing and springs by purpose and frequency

Ask about purpose and frequency before asking about duration. Custom choreography becomes a repeated tax during rapid value changes, keyboard navigation, filter typing and dense table scanning. An occasional drawer, save confirmation or row removal may benefit from spatial continuity. A rare staged reveal may use a limited delight budget, but the task must not wait for it. If motion has no nameable purpose such as feedback, state indication, spatial consistency, continuity or explanation, choose a static treatment. [[83]](https://raw.githubusercontent.com/emilkowalski/skills/main/skills/animate/SKILL.md) [[87]](https://raw.githubusercontent.com/emilkowalski/skills/main/skills/improve-animations/SKILL.md)

Tweens suit deterministic endpoints such as opacity, color, short popover movement and ordinary entrance or exit. A spring is meaningful when velocity and interruption are part of the interaction, as with dragging, swiping, a reversible sheet or momentum. Adding bounce to every toggle does not create physicality. A settled interface may be clearer with little or no bounce. Linear easing can fit constant-rate progress or genuinely continuous travel, but usually not an arriving control. Curves and timing tokens within a component family should be related, yet different distances and purposes should not be forced into an identical duration. [[88]](https://raw.githubusercontent.com/raphaelsalaja/skill/main/skills/to-spring-or-not-to-spring/SKILL.md) [[85]](https://raw.githubusercontent.com/raphaelsalaja/skill/main/skills/12-principles-of-animation/SKILL.md) [[89]](https://raw.githubusercontent.com/wshobson/agents/main/plugins/ui-design/skills/interaction-design/SKILL.md)

Use stagger only in an infrequent entrance where sequence reveals semantic order. A short overlap among a small group can clarify hierarchy. Do not cascade a large result collection, filter response, tab switch, quantity update or every-scroll reveal. Interaction should become available as soon as the first item is visible, and later items must not remain disabled behind animation. Do not turn illustrative stagger values into a fixed recipe. Evaluate total group delay and item count. Staggering hundreds of cards provides neither visual clarity nor runtime restraint. [[90]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/emilkowalski-motion/SKILL.md) [[91]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/gsap-performance/SKILL.md) [[48]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-ui/SKILL.md)

### Support interruption, reversal and rapid input

A rapidly triggered state should retarget from its current visual value. If a user closes a drawer while it opens, reverses a save, quickly toggles a filter or dismisses a notification, do not finish the old sequence before starting the reverse. CSS transitions are useful for dynamic binary states because they can retarget in mid-flight. Keyframes suit one-shot staged sequences. A gesture spring can carry current velocity. The exit path should remain coherent with the entrance path, but its duration may be shorter when the next state is waiting. [[84]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/review-animations/STANDARDS.md) [[48]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-ui/SKILL.md)

The implementation contract must include cancellation. Starting a new animation should cancel stale animation and timers. Missing, canceled or duplicate `transitionend` events must not block DOM cleanup. Release observers, animation-frame callbacks, timelines, pointer capture and listeners on unmount or navigation. Every `requestAnimationFrame` loop needs an explicit stop condition. Rapid repeated notifications must not accumulate duplicate nodes or tweens.

Animation completion must not commit application state. Save, remove and selection state should become deterministic first, with animation serving only as presentation. If a motion library is used, do not mix competing CSS and JavaScript measurement systems inside one component, and pause or destroy inactive or off-screen timelines. [[92]](https://raw.githubusercontent.com/ibelick/ui-skills/main/skills/fixing-motion-performance/SKILL.md) [[91]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/gsap-performance/SKILL.md) [[89]](https://raw.githubusercontent.com/wshobson/agents/main/plugins/ui-design/skills/interaction-design/SKILL.md)

### Refine tooltip warm-up and icon transitions

Repeating a long fresh delay on every toolbar icon makes scanning sluggish. The first hovered tooltip may use an intent delay. After one tooltip opens, nearby sibling tooltips may switch more quickly or instantly during a temporary warm period. Reset that warm state when the pointer leaves the toolbar, an idle interval passes or focus context changes. Do not place an essential keyboard-focus label behind a hover delay, and do not make a tooltip the sole explanation on touch. A tooltip should originate at its trigger, fit within the viewport and avoid covering the moving pointer target. [[77]](https://www.ui-skills.com/playbook/warm-toolbar-tooltips) [[84]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/review-animations/STANDARDS.md)

During an icon state transition, keep the glyph baseline, view box and optical center stable. An outline-to-filled save icon, play and pause pair, or changing chevron must not move its parent button. Same-size icon layers can crossfade in place, and `currentColor` can inherit state tokens. Use a morph only when start and end paths remain recognizable and the intermediate silhouette is clean. Forcing mismatched SVG paths can create awkward knots.

Inline SVG permits animation of internal parts, but optimization must preserve the `viewBox` and any IDs referenced by CSS or JavaScript. Stroke drawing, morphing, blur and looping marks are not defaults for task controls. The static final state and accessible name come first. [[86]](https://raw.githubusercontent.com/jakubkrehel/make-interfaces-feel-better/main/skills/make-interfaces-feel-better/SKILL.md) [[93]](https://raw.githubusercontent.com/iart-ai/web-animation-skills/main/skills/svg-animation/SKILL.md)

Tune icon stroke to the optical weight and family of adjacent text. The exact stroke value depends on font, size and rendering context. An asymmetric glyph may need a tiny optical adjustment rather than strict mathematical centering, but its hit box and alignment grid must stay stable. Retain a non-color selected cue with an active fill. A small isolated icon may gain polish from blur or a crossfade, but use plain opacity or scale when blur adds paint cost or creates a muddy intermediate frame. [[48]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-ui/SKILL.md) [[92]](https://raw.githubusercontent.com/ibelick/ui-skills/main/skills/fixing-motion-performance/SKILL.md)

### Provide meaningful reduced-motion alternatives

Do not reduce the entire preference to a global `duration: 0.01ms` workaround. Identify the meaning of each pattern and provide a replacement:

| Standard treatment | Reduced-motion alternative |
|---|---|
| Drawer travel | Immediate visibility or a short fade |
| Shared-element zoom | Crossfade |
| Parallax or three-dimensional tilt | Static depth |
| Shimmer | Quiet progress or status |
| Stagger | Simultaneous reveal |
| Icon morph | Direct icon swap |

Preserve useful state boundaries, visible focus, truthful loading and undo availability. Opacity can also distract some users, so do not assume that a large full-screen crossfade is automatically safe. [[83]](https://raw.githubusercontent.com/emilkowalski/skills/main/skills/animate/SKILL.md) [[90]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/emilkowalski-motion/SKILL.md)

Honor the preference from initial render so unwanted first-frame travel does not run. A JavaScript or motion-library variant should respond if the media preference changes during a session. A CSS variant must actually override through correct source order and specificity. Pause autoplay and looping motion while it is off screen. The fallback must reach the same end state and functionality. It must not leave hidden content, a stale transform, an unremoved overlay or cleanup that depends on an animation event.

### Constrain three-dimensional and immersive effects

Perspective, `rotateX`, `rotateY`, `preserve-3d`, motion paths, parallax and immersive media can be expressive tools, but they are not task-interface defaults. Consider them only at a constrained editorial or storytelling edge where facts, key values, controls and the reading plane remain stable. Avoid pointer-following tilt across collections, flips that hide facts, scroll-jacked discovery and continuous blur used merely to imply depth.

Any such effect needs a touch and keyboard equivalent, a static reduced-motion composition, acceptable low-end performance, and tested clipping and stacking behavior. A three-dimensional transform is not free merely because it may be composited. Large layers, texture memory and compositing still carry costs. [[84]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/review-animations/STANDARDS.md) [[92]](https://raw.githubusercontent.com/ibelick/ui-skills/main/skills/fixing-motion-performance/SKILL.md)

### Protect the attention budget

Routine browsing, filtering, comparison and selection states should remain quiet. Keep cursor trails, branded preloaders, liquid or character-art scenes, page-wide parallax and dramatic text reveals outside default task flows. Use an occasional editorial effect only when factual content, ordinary scrolling, keyboard and touch access, and loading cost remain sound. There is no fixed animation quota.

A quiet underline can clarify links, a conditional edge cue can indicate genuine overflow, and a short chevron response can confirm a real disclosure state. Reduced motion may remove movement, but not content or state. Adapt any externally sourced effect to one typography, color, spacing, focus and geometry language rather than assembling a showcase of unrelated treatments.

## 18. Image, font and layout performance

### Reserve media space before content arrives

Reserve a card's media aspect ratio before its content arrives. Intrinsic width and height, or an equivalent ratio, gives the browser geometry in advance and prevents later movement [[3]](https://web.dev/articles/optimize-cls). Place mixed-source images in a consistent media frame. Control cropping according to subject type, but do not cut off important content merely to create false uniformity. Badges, rating rows and key numeric attributes should not move vertically after an image loads.

Responsive media should deliver appropriate detail for each slot, not the largest file at every viewport. `srcset` can provide candidate widths, while `sizes` should honestly describe the rendered slot so the browser can choose according to the actual grid width. When candidates represent the same composition, preserve the intended aspect ratio and reserve dimensions [[3]](https://web.dev/articles/optimize-cls). If a compact layout uses a separately art-directed crop, declare its geometry and keep its subject safe.

Do not automatically preload a hero or primary image on every route. The Largest Contentful Paint candidate can change with route and viewport. Consider preload only when measurement shows that the same image is the critical visual and ordinary discovery happens too late. An extra early request can compete with other critical assets. Media below the fold may load lazily; the first meaningful visual generally should not.

### Make font loading a visible contract

Whatever font family is chosen, its required scripts, symbols, numerals and fallback coverage must match visually. Text should be readable first. Arrival of the web font should not sharply change title wrapping, card height or button width. Font loading strategy affects Largest Contentful Paint, first paint and layout stability. Metric-compatible fallbacks or metric overrides can reduce movement [[13]](https://web.dev/articles/font-best-practices) [[3]](https://web.dev/articles/optimize-cls).

Do not download every weight merely to signal visual richness. Include only styles and axes that are actually used. A variable font may be smaller in one case and larger than a few static files in another [[13]](https://web.dev/articles/font-best-practices). Preload fonts selectively, limited to a critical face that will certainly be used. Giving unnecessary faces early priority wastes resources. Essential facts must remain immediately legible in a system or fallback face. Brand expression must not depend on a delayed font.

### Reveal progressively without destabilizing the surface

Stability does not require withholding a blank page until every asset is perfect. A header, result heading, card frames and available text can appear in stable order while images fill progressively. Do not insert late promotional content above a collection that a user has begun scanning.

A skeleton should describe the broad geometry of the final structure, not invent exact copy. Within a card collection, keep the media slot, title allowance, metadata or key-value rows, and action position consistent. Do not hide a real title through an inaccessible clamp. Make its full value available in the detail view or another accessible text path.

### Do not assume transforms are free

Think of browser work broadly as layout, paint and compositing. `transform` and `opacity` are usually the first candidates for movement because they need not run layout on every frame, but they are not guaranteed to be GPU-backed or free. Layer promotion depends on browser, device and context. A large transformed image, huge translucent surface, nested three-dimensional context or many promoted cards can increase memory use, texture upload and compositing cost. Filters, backdrop filters, masks, gradients, animated shadows and SVG filters can be paint-intensive, especially across a large area or in a continuous loop. A small isolated effect may be acceptable. Profile the real effect instead of declaring performance from a property name. [[92]](https://raw.githubusercontent.com/ibelick/ui-skills/main/skills/fixing-motion-performance/SKILL.md) [[94]](https://raw.githubusercontent.com/iart-ai/web-animation-skills/main/skills/60fps-animation/SKILL.md) [[91]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/gsap-performance/SKILL.md)

`will-change` is not a blanket optimization. Use it temporarily on a known soon-to-animate element only when an observed first-frame hitch or measured need justifies it, then remove it after the element becomes idle. Giving every card a permanent layer or `translateZ(0)` can worsen GPU memory and compositing. Scaling a container can raster-scale its text and images, producing softness or distortion.

For real grid relocation, commit the final DOM layout, measure first and last geometry, then invert and play through a FLIP-style pattern when appropriate. Perform all geometry reads before writes. Reading and then writing each card in sequence can create a forced-reflow chain. [[94]](https://raw.githubusercontent.com/iart-ai/web-animation-skills/main/skills/60fps-animation/SKILL.md) [[92]](https://raw.githubusercontent.com/ibelick/ui-skills/main/skills/fixing-motion-performance/SKILL.md)

Avoid `transition: all`. A theme switch, responsive change, focus state, disabled state or late image style can unintentionally animate width, shadow, color or position. List only intended properties. This does not mean absolutely banning every layout or paint property. A tiny isolated color or border repaint, or a measured height transition for disclosure, may be the correct tradeoff. Justify it by surface size, frequency and fallback. Large continuous layout animation should not be the default.

When a shadow lift is needed, crossfading the opacity of a prepainted pseudo-layer is one option. Instead of animating blur across a large modal backdrop, prefer a solid scrim or a static bounded treatment when it provides more predictable cost. [[48]](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-ui/SKILL.md) [[92]](https://raw.githubusercontent.com/ibelick/ui-skills/main/skills/fixing-motion-performance/SKILL.md) [[94]](https://raw.githubusercontent.com/iart-ai/web-animation-skills/main/skills/60fps-animation/SKILL.md)

### Batch measurement, event and scroll work

Reading `getBoundingClientRect`, `offsetWidth`, `offsetHeight`, `scrollTop` or computed style after a DOM or style write in the same frame can force synchronous layout. During collection reordering, comparison-column changes or expanding detail, take required measurements as a snapshot. Batch all reads, perform the mutation, then use transforms as a visual bridge.

Do not perform a fresh layout measurement, create a new tween or trigger a state render for every pointer or scroll event. Coalesce frame-synchronized visual writes through `requestAnimationFrame` or an established scheduler, and give every loop a stop and cancellation contract. [[92]](https://raw.githubusercontent.com/ibelick/ui-skills/main/skills/fixing-motion-performance/SKILL.md) [[95]](https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/reference/optimize.md)

For visibility, consider `IntersectionObserver` or supported scroll or view timelines instead of scroll polling, but do not continuously repaint a large area. Debounce or coalesce expensive refresh work after resizing or content loading. Do not globally refresh timelines when no layout change occurred. Never gate access to content on scroll position.

The measured goal is not a fixed "60 fps" badge. Evaluate input response, dropped frames, long tasks, layout and paint traces, and visual correctness on target devices. Both high-refresh displays and low-end devices expose assumptions. [[92]](https://raw.githubusercontent.com/ibelick/ui-skills/main/skills/fixing-motion-performance/SKILL.md) [[91]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/gsap-performance/SKILL.md)

### Treat image reservation, decoding and fallback as one contract

Receiving a network response, decoding its bytes and safely painting the image are separate moments. Do not give every possible primary image eager or high priority without route evidence. Media below the fold can use lazy loading and asynchronous decoding. When negotiating modern formats, retain a dependable fallback `<img>`. Explicit intrinsic dimensions or an aspect ratio keep the slot stable during loading, delayed decoding and source failure. [[96]](https://raw.githubusercontent.com/addyosmani/web-quality-skills/main/skills/performance/SKILL.md)

An image can crossfade briefly once decode-ready, but do not prolong a blank slot for the sake of animation. A rejected decode or loading error must not leave an endless skeleton or shimmer. Show a neutral media fallback, useful alternative text or textual identity, and stable card anatomy. When retrying a new source, do not flash away a previous valid image without reason. A stale request must not overwrite the currently selected option. Ensure final `object-fit` and cropping preserve the important subject.

A gallery may decode its likely next image in advance when the choice is bandwidth-conscious. Do not predecode hundreds of images and trade network delay for memory pressure. Skeleton, image and fallback must use exactly the same reserved media box. Do not add border geometry after loading and introduce a one-pixel shift.

Animated shimmer across a large collection has continuous paint and attention costs. In reduced-motion mode, use a static placeholder. For a long wait, honest status text may be better. Refresh an animation timeline after image completion only if geometry truly changed. Declared aspect ratio exists partly to prevent unnecessary remeasurement. [[92]](https://raw.githubusercontent.com/ibelick/ui-skills/main/skills/fixing-motion-performance/SKILL.md) [[96]](https://raw.githubusercontent.com/addyosmani/web-quality-skills/main/skills/performance/SKILL.md)

### Skip rendering in long collections carefully

`content-visibility: auto`, containment and virtualization can reduce off-screen work in long lists, but they are three different techniques. Content visibility generally retains DOM and accessibility structure while deferring rendering, and an intrinsic-size estimate can support scrollbar and layout stability. Virtualization may mount, unmount or recycle nodes. It can save more work in very large lists, but introduces complexity for focus, screen-reader position, browser find-in-page, back-navigation scroll restoration, measurement and variable card height. Do not add a virtualization dependency without list size and measured bottleneck evidence. [[95]](https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/reference/optimize.md) [[96]](https://raw.githubusercontent.com/addyosmani/web-quality-skills/main/skills/performance/SKILL.md) [[91]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/gsap-performance/SKILL.md)

Browser Find is not a replacement for a product's own complete search, but keeping currently loaded result text findable remains useful. A virtualized item must not unmount while it has keyboard focus. Before setting programmatic focus, ensure or render the item, then focus it. Screen-reader-visible position and count must be truthful. A recycled card must not leak an old selected or saved label, and an active descendant must reference an actual node.

When using `content-visibility`, test revelation of focus and search targets, sticky overlays, and intrinsic estimates against actual responsive card height. A focused item must not visually vanish because of off-screen optimization.

Do not make a footer or recovery path unreachable under the label of smooth infinite loading. A chunked "more results" control or paginated route may be simpler, more findable and easier to restore. If virtualization is selected, test no-results, partial failure, filter refresh, item removal and undo, dynamic numeric text, image reservation and reduced-motion paths, not only steady scrolling. Optimization success is not merely a lower DOM-node count. Browsing, comparison, save and remove actions, and focus continuity must all survive.

## 19. Semantic tokens and component contracts

### Separate meaning from raw values

An interface needs semantic language before its final palette, font or radius is fixed. A primitive value may be `blue-600` or `8`. A semantic role may be `interactive-primary`, `focus-indicator`, `surface-raised` or `feedback-critical`. A component role may be more specific, such as `filter-chip-selected-border`. Components should consume intent rather than an accidental color name. Meaning should remain stable when a theme changes.

State roles should cover rest, hover-capable, pressed, focus-visible, selected, disabled, loading and inverse or high-contrast contexts. A hover token is an enhancement where the capability exists, not a state requirement on every device. Assigning the same token to focus and selection is a semantic error. Critical text, border and icon may require different values, but review their final combination for contrast and a non-color cue.

DTCG 2025.10 defines values, types, references, groups and deprecation for token exchange. It is a stable Candidate Recommendation, but it is neither a W3C Recommendation nor a W3C Standards Track standard [[36]](https://www.designtokens.org/TR/2025.10/format). Use it as interoperability vocabulary, not as a prescription for a product's taxonomy, palette or design-system artifacts.

### Define contracts beyond screenshots

A component contract should combine anatomy, state and adaptation. A card contract can define media slot, title, metadata, key numeric attribute, actions, focus order and loading geometry. A filter-chip contract can define selected cue, removable form, wrapping and forced-color fallback. A dialog contract can define title, close control, scroll owner, focus return, safe area and reduced-motion alternative. This is not a code plan. It is interface truth that prevents variants from drifting.

Order border, surface and elevation intentionally. Spacing should establish grouping first. A surface can distinguish a region, a border can clarify an edge or state, and elevation should explain actual overlay or occlusion. Stacking border, shadow, tint and radius on every card, input and chip fragments hierarchy. Forced colors may remove shadow, so an essential boundary needs a border or outline fallback [[31]](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors).

### Use a complete contract checklist

Document all of the following:

- required and optional slots;
- labeling rules and accessible names;
- content growth and overflow;
- the state matrix;
- focus order and focus return;
- touch-target geometry;
- responsive substitution;
- placement of empty, loading and error states;
- reduced-motion behavior;
- forced-color behavior.

A responsive substitute must be task-equivalent. A wide filter rail may become a compact drawer, but selection and result context should remain. Tabs may become accordions, but the contract must specify their different semantics. Keep aliases traceable. DTCG references provide a model for resolving aliases to explicit values and a mechanism for deprecating replaced roles [[36]](https://www.designtokens.org/TR/2025.10/format).

The output of this process is not automatically a final token file or complete design system. Roles and contracts should be explicit enough that a later change in brand direction does not change contrast, visible focus, truthful selection, loading geometry, safe-area behavior or resilience to supported content.

### Add motion and visual performance to the contract

For every animated component, document its named purpose, trigger and input modes, frequency tier, starting and ending geometry, transform origin, exact animated properties, motion-token class, interruption and reversal behavior, and reduced-motion replacement. Explicitly define ownership during entrance and exit: when the DOM becomes inert, hidden or removed; when focus moves or returns; and what performs cleanup after a canceled completion. Animation must not be the sole driver of business state, accessible naming or an undo timer. [[87]](https://raw.githubusercontent.com/emilkowalski/skills/main/skills/improve-animations/SKILL.md) [[83]](https://raw.githubusercontent.com/emilkowalski/skills/main/skills/animate/SKILL.md)

On the performance side, record expected surface size, likely simultaneous instance count, measurement reads and writes, image aspect reservation, decoding and error states, and off-screen policy. `will-change`, virtualization, animated filters and motion timelines are documented exceptions, not default tokens. Their cleanup and validation paths belong in the contract.

Extend the component matrix beyond rest, hover, pressed, focus, selected, loading and error. Include mid-transition, rapid reversal, removal before exit, reduced motion, image decode failure and a low-performance mode. Motion may share a curve or duration token, but the semantic contract decides when an instant response is more honest. [[92]](https://raw.githubusercontent.com/ibelick/ui-skills/main/skills/fixing-motion-performance/SKILL.md) [[91]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/gsap-performance/SKILL.md)

### Keep primitive, semantic and component tokens in three layers

Primitive tokens are raw materials: color ramps, font families, spacing steps, radii, shadows, durations and easing curves. Semantic tokens describe a value's job, such as `surface-canvas`, `text-muted`, `border-subtle`, `action-primary`, `focus-ring` or `feedback-danger`. Create a component token only when the contract needs greater specificity than a shared meaning, such as `item-card-media-radius` or `comparison-row-difference-surface`.

Binding component CSS directly to a primitive such as `orange-600` breaks meaning when a theme changes. A semantic alias between the component and raw palette allows the palette to migrate while behavioral intent remains stable. Use this one-way dependency:

**primitive -> semantic role -> component slot or state**

Do not let a component token expose primitive naming again. For each interactive family, map rest, hover-capable, pressed, focus-visible, selected, disabled and loading. Do not merge `selected` with `focus`, or assume `danger` is merely a shade of brand accent. For each surface pair, verify on-surface text and icon, border and focus treatment. A contrast claim about an isolated hex value is not a component contract.

Tokens can carry typed values beyond color, including font family, dimension, number, shadow, duration and easing. A useful system connects background, surface, foreground, accent states, feedback, type scale, leading, spacing, radius, elevation, focus, motion and container gutters. The lesson is not to copy exact names, but to avoid reducing visual direction to a palette. Audit declared, referenced, unused and undeclared tokens together. A swatch sheet alone cannot show whether the inventory is coherent.

### Make the visual-direction specification descriptive

A usable visual-direction specification connects a visual thesis to implementation contracts. It should include at least:

- **Mood and task fit:** why the interface should feel calm, editorial, dense, tactile, technical or bold, and which tasks that tone supports.
- **Hierarchy model:** whether imagery, type, key numeric attributes, comparison facts or actions receive primary visual weight.
- **Typography roles:** display, body, number and metadata relationships, fallback expectations, and required language and symbol coverage.
- **Color roles:** canvas, surfaces, text levels, action, focus and feedback, not merely named swatches.
- **Density and grid:** distinct density modes for browsing collections, detail reading and comparison tables.
- **Geometry and depth:** radius family, border and elevation logic, and image-cropping stance.
- **Motion voice:** which state transitions are instant, quiet or expressive, and what remains in reduced-motion mode.
- **Component and state specimens:** actual states for buttons, fields, cards, chips, drawers, dialogs and tables.
- **Anti-drift rules:** combinations that would make the direction incoherent, without turning stylistic preferences into universal bans.

Keep prose intention, machine-readable values, component usage and provenance as separate but mutually supporting artifacts. No one artifact substitutes for all the others.

### Include visual grammar in each component contract

Add role-token mapping, content density, radius and elevation tier, icon family, image behavior, numeric alignment and allowed emphasis count to the anatomy and state checklist. For a card, do not stop at a padding value. In compact and comfortable modes, define relationships among media and copy, title growth, numeric baseline, badge collisions and persistent save or selection affordances.

For comparison rows, define tabular numerals, missing-value treatment, sticky context and difference emphasis. For a pending selection or summary, reconcile quantity, line total, remove, save and undo within one visual state model.

Separate page shape from component shape. Placing cards, specification rows or editorial modules in the same grid does not give them the same purpose. Select the archetype from the real task. A collection item needs the facts and actions required for scanning and choosing; recoloring a marketing tile does not turn it into a functional list item. Keep only variation controls that improve scanning, content fit or responsive adaptation.

### Give reusable components an implementation contract

A visual contract survives implementation when a component's public shape is clear. Use shared components for repeated cards, numeric clusters, filter controls, media frames and feedback rows, but do not combine unrelated blocks merely because they share a border radius. The unit of reuse is shared meaning plus shared states plus shared adaptation.

Do not replace native `button`, `a`, `label`, list or table semantics with styled generic containers to match a screenshot. Familiar behavior and accessible naming are part of the component. Visible focus, resilient long content, empty and error states, and explicit interactive behavior are implementation baselines. [[98]](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/e3d624baaf29dc1fc645aff3e38f03e564d2d6b1/AGENTS.md)

When rendering a list, use stable entity identity as the key rather than the current index. Otherwise removal, sorting or filtering can attach local state to the wrong card. A wrapper component should intentionally forward and merge its consumer class, relevant HTML attributes, event handlers and reference. Do not silently overwrite the consumer class with an internal class. Do not spread properties blindly if that can leak invalid DOM attributes or conflicting accessible names.

Name variants semantically, such as `selected`, `unavailable` and `loading`, rather than after a one-off screenshot or patch. Styling scope should follow component ownership. Shared token roles may be global, component layout should remain with the component, and route-specific composition belongs to the page or module. Avoid broad descendant selectors or global element overrides that make one reference match by accidentally restyling other surfaces.

Keep a one-off inline value only when it represents genuinely data-driven geometry. Promote a recurring visual decision into an existing token or component variant. This is not architecture for its own sake. It keeps focus rings, media ratios, text growth and selected states visually reliable across reused instances.

## 20. Surface-level visual reference by screen type

Give every major surface an attention map: the user's main question, the primary visual anchor, supporting information and the next useful action. A shared header and shared tokens provide consistency, but giving every surface an overview-style hero does not. Accessible controls, relevant attributes and meaningful hierarchy should jointly determine composition. [[1]](https://www.nngroup.com/articles/visual-hierarchy-ux-definition) [[2]](https://baymard.com/blog/list-item-design-ecommerce) [[5]](https://www.w3.org/TR/WCAG22/)

### Entry or overview surface

- **Visual job:** Communicate the breadth of available content and dependable starting points. Search, navigation and labeled category or task choices should anchor orientation. A focused editorial or campaign region may support discovery without overwhelming the route into content.
- **Dominant element:** A stable global header and a clear discovery entry, category family or overview subject. An overview for read-only or sample data must label that status locally rather than resemble an editable operational workspace.
- **Secondary elements:** Secondary collections, utility links and restrained editorial media. Full-bleed or asymmetric imagery can establish a memorable subject, but must preserve factual evidence, readable overlay contrast and the route onward. [[62]](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/imagegen-frontend-web/SKILL.md)
- **Density:** Low to moderate, with strong separation among utilities, navigation choices and editorial content. Do not fill every viewport with competing full-width promotions.
- **States:** Partial media failure must not remove navigation. An empty or unavailable category needs a clear continuation route. Read-only information must not present nonfunctional controls as actionable. Captured references establish relative emphasis only, not exact positions, brand styling or proof of superior performance. [[37]](https://baymard.com/learn/ecommerce-category-page)

### Browse or listing surface

- **Visual job:** Establish the current scope, expose meaningful subgroups or filters, and let users scan comparable entities. A category overview may foreground families and subgroups, while an actual listing should foreground items and narrowing controls.
- **Dominant element:** A compact scope header, active exploration state and a stable rhythm of comparable cards or rows. Narrowing controls should appear before optional editorial content.
- **Secondary elements:** Category context, active filters, sort controls, comparison or save controls, and restrained editorial imagery only when it improves understanding of the collection.
- **Density:** Moderate to high, consistent enough for comparison. Card anatomy, image framing, title allowance, metadata, key values and actions should line up without making every item visually identical.
- **States:** Empty or unavailable scope, loading, partial failure and image failure should preserve known titles and attributes. During refresh, distinguish the old snapshot from the pending result. Avoid a large campaign region followed by multiple navigation bands that push the actual collection below the initial viewport.

### Search results surface

- **Visual job:** Answer which results correspond to the query and how they can be narrowed. Keep query, count, sorting and active filters in one related control region.
- **Dominant element:** Query context, the result collection and narrowing controls.
- **Secondary elements:** Comparable attributes and restrained status or offer cues. Save and comparison controls should remain available without dominating ordinary scanning.
- **Density:** Moderate to high, optimized for repeated comparison rather than decorative variation.
- **States:** Distinguish refreshing, no match and retrieval failure. During refresh, do not present a new filter label beside old items and an old count as though all belong to one completed result. For no match, keep query and active filters visible, explain which condition yielded no match, and place edit or clear actions in the same attention zone. Do not hide recovery beneath a giant illustration. When item data is known but images fail, retain useful text and honest media placeholders.

### Detail view

- **Visual job:** Coordinate evidence about one entity with the current option or state and the next meaningful action.
- **Dominant element:** Media or primary evidence, identity, selected option, key numeric attribute and relevant availability or status as one unit.
- **Secondary elements:** Specifications, explanatory content and sample or historical feedback in manageable sections. Required choices must not hide inside a collapsed secondary panel.
- **Density:** Moderate around the decision summary, then denser in specifications and supporting evidence. Editorial media may be expressive, but it must not hide the object or turn a key value into a detached promotional sticker.
- **States:** Unavailable option, failed optional panel, image failure and loading must preserve the core identity and current selection. A stronger composition shows verified primary evidence, selected label, current value or availability, and the local action in one coordinated region.

### Comparison surface

- **Visual job:** Keep compared identities and row meaning visible while making important differences easy to scan.
- **Dominant element:** Persistent entity headers, aligned row labels and difference-bearing values.
- **Secondary elements:** Shared attributes, explanatory labels and controls for changing the compared set.
- **Density:** High but disciplined. Use alignment and restrained difference emphasis rather than rainbow highlighting or a decorative "winner" card.
- **States:** Missing values, unavailable entities, changed comparison columns and compact layout must all remain intentional. A compact comparison should preserve meaningful identities and differences through a readable paired composition or a clearly labeled, locally scrollable table. It should not merely shrink a wide table. [[24]](https://baymard.com/blog/provide-comparison-features)

### Saved collection

- **Visual job:** Make the reason for the collection and the saved state unmistakable. Recent history must not masquerade as intentional saving.
- **Dominant element:** Saved entities and a persistent cue explaining their saved status.
- **Secondary elements:** Move, remove or continue actions, plus the same factual identity, media framing and key-value hierarchy used elsewhere.
- **Density:** Similar to browsing, but actions and status should reflect collection management rather than discovery.
- **States:** First use needs a concise explanation and a route back to browsing. Routine emptiness should not look like a critical failure or a celebration. Removal should update the local object, support undo when offered, and disclose any persistence limitation honestly.

### Review-and-confirm step

- **Visual job:** Let users review a pending set, reconcile quantities or values, understand a coherent summary, correct mistakes and understand the exact commitment boundary.
- **Dominant element:** Editable selected lines plus a summary whose totals or combined values visibly agree with them.
- **Secondary elements:** Remove, save for later, undo, provider or offer details where relevant, a correction route and a clear statement of capability. Promotional content must not interrupt the primary review task.
- **Density:** Moderate to high for editable lines, compact and strongly grouped for the summary. A later review screen may become calmer, but should retain a visible route back to editing.
- **States:** Removal and undo, pending or failed change, inconsistent data, and read-only review must look intentional. Do not rely on a disabled final button to communicate a boundary. If the surface cannot complete the represented operation, label it as review or preview, omit completion claims and success styling, and provide routes to edit or continue elsewhere. Do not imitate a multi-step commitment flow, request sensitive details or display a confirmation result when those capabilities do not exist. Historical or sample information should remain visibly separate from the user's current pending set.

This reference describes visual review criteria. It does not prescribe a final hero layout, palette, font, breakpoint, category count or implementation inventory.

## 21. Standards and adjustable starting points

Numeric guidance is useful only when its role is explicit. Contrast and reflow thresholds are requirements from a named standard, while type scales, spacing systems and motion timings are adjustable product decisions. Combining both kinds of value in a single undifferentiated list of "best practices" can cause a design system convention to be mistaken for a compliance requirement. [[5]](https://www.w3.org/TR/WCAG22/) [[11]](https://v10.carbondesignsystem.com/guidelines/typography/overview) [[9]](https://carbondesignsystem.com/elements/spacing/overview)

### Accessibility reference

| Concern | Referenced requirement or context | Practical interpretation |
|---|---|---|
| Text contrast | Normal text must have a contrast ratio of at least 4.5:1; qualifying large text must have a ratio of at least 3:1, subject to the criterion's exceptions | Labels, key numeric attributes and useful metadata must remain legible against the surfaces on which they actually appear |
| Large text classification | WCAG defines large text as at least 18 pt, or at least 14 pt when bold | Do not describe a small bold label or badge as large text merely to apply the lower contrast threshold |
| Non-text contrast | Visual information needed to identify interface components or states, and parts of graphics needed to understand content, must have a contrast ratio of at least 3:1 against adjacent colors, subject to exceptions | Selected markers, necessary field boundaries and other meaningful interface visuals need distinguishable treatment |
| Text resize | Content and functionality must survive text resizing to 200%, subject to the stated exceptions | Labels, titles and clusters of numeric information should expand or wrap rather than disappear |
| Reflow | Content must reflow vertically at a width equivalent to 320 CSS px without two-dimensional scrolling, except where a two-dimensional layout is necessary | The overall page should reflow; a necessary comparison table may instead provide its own clearly scoped and usable scrolling region |
| Text spacing | No content or functionality may be lost when line height is set to 1.5 times the font size, paragraph spacing to 2 times the font size, letter spacing to 0.12 times the font size and word spacing to 0.16 times the font size | These values are resilience test settings, not mandatory authored defaults |
| Pointer target minimum | WCAG 2.2 Level AA specifies 24 x 24 CSS px, or compliance through the applicable spacing or other exceptions | Minimum conformance should not be confused with a comfortable touch target |
| Enhanced target size | WCAG Level AAA specifies 44 x 44 CSS px, subject to applicable exceptions | This is a useful generous design reference, but it must not be presented as a universal Level AA requirement |
| Focus not obscured | The Level AA minimum requires that an author-created layer does not entirely hide the focused component | Prefer clear, full visibility; sticky bars and other persistent layers must not strand focus behind them |
| Drag interaction | Provide a non-dragging, single-pointer alternative unless dragging is essential | Sliders, media controls, carousels and other direct manipulation interfaces should not require precise dragging |

These entries summarize WCAG 2.2. The complete criterion wording and its exceptions remain authoritative, and satisfying this table alone does not certify a product or interface. [[5]](https://www.w3.org/TR/WCAG22/)

### Illustrative starting scale, not an approved design system

| Decision | Possible starting point | What should change it |
|---|---|---|
| Spacing rhythm | A 4-pixel base, with common steps of 8, 12, 16, 24, 32, 48 and 64 | Content grouping, font metrics, optical balance and viewport pressure |
| Body reading | Around 16/24 for font size and line height, with compact supporting text around 14/20 | Font x-height, content importance, text zoom and reading distance |
| Card title | Around 16 to 18 for font size, with comfortable multiline leading | Naming patterns, identifiers, available width and the distinctions users need to perceive |
| Heading | Around 24/32 for a clear section or page role | The heading hierarchy and selected font, not screen size alone |
| Display text | A larger expressive role only in short editorial or campaign moments | Fit on small screens, balance with imagery and the need to keep useful discovery content visible early |
| Prominent numeric attribute | Around 18 to 24 on a card, and potentially larger in a detail view | Relative hierarchy, value length, unit or option qualifiers and the font's numerals |
| Media frame | Square for many mixed-content collections, or portrait where the content and art direction support it | Subject shape, crop safety, actual assets and coherence within the collection |
| Touch control comfort | Around 44 x 44 or a larger usable hit region where feasible | Spacing, error risk, input mode and use on real devices |
| Motion classes | Roughly 100 to 160 ms for micro feedback, 160 to 240 ms for ordinary transitions and 240 to 360 ms for larger reveals | Travel distance, repetition, device performance, interruption cost and reduced motion |
| Corner and effect language | A small, consistent family for fields, cards and overlays, with effects tied to meaning | Brand character and structural purpose, rather than applying pill shapes or shadows everywhere |

These are **adjustable starting points**, not sourced optima, mandatory timers or a finished system. A team must still choose its exact palette, font family, grid column count, breakpoints, comparison limits and radius set. Grid fit should follow the minimum width required for readable content. At narrow widths, fewer columns are preferable to shrinking critical text until it becomes illegible. A fast, committed action should never wait for an animation solely to conform to a timing row in this table.

For paragraph-like descriptions, Baymard's guidance of 50 to 75 characters per line can provide a starting measure. It should not be applied literally to card titles, chips, numeric values or every narrow viewport. Tokens should support the work of the content rather than mechanically impose one line length everywhere. [[12]](https://baymard.com/blog/line-length-readability)

## 22. Visual review checklist

Do not limit interface review to one perfectly populated screen. Evaluate every important component with realistic long text, large numeric values, missing media, errors, selected states and narrow viewports. The same design must survive differences in content truth and user settings. Otherwise, its apparent consistency applies only to the easiest content.

### Composition and identity

- [ ] The main task, primary region and next action are recognizable, and competing visual emphasis is controlled.
- [ ] The header, section starts, media frames, key numeric regions and actions use shared alignment.
- [ ] Related elements are grouped more closely, while unrelated groups have clear separation.
- [ ] Imagery supplies useful evidence or context rather than random filler or generic promotional noise.
- [ ] Originality comes from typography, art direction and composition, not copied branding or an unrelated stack of effects.

### Content and capability truth

- [ ] Comparable entities present comparable attributes and use a consistent anatomy for important numeric information.
- [ ] Truncation does not hide an essential identifier, size, capacity or other distinguishing information.
- [ ] Current values, previous values, per-unit values, conditional offers and option qualifiers are unambiguous where those concepts apply.
- [ ] Media preserves meaningful edges, and scale, zoom and thumbnails reflect the imagery that is actually available.
- [ ] Simulated ratings, third-party information, time commitments or history are labeled, and the interface fabricates no endorsement, urgency or operational promise.
- [ ] Selected options, quantities or values, totals and saved states remain coherent, and the interface does not imply that an unsupported commitment can be completed.

### Components and behavior

- [ ] Hover, focus, pressed, selected, unavailable, loading, error and success states communicate visibly different meanings.
- [ ] Icon-only actions are limited, contextual and accessibly named; important or ambiguous actions retain visible labels.
- [ ] Critical errors and recovery controls persist in the relevant region; a transient notification is not the sole carrier of necessary information.
- [ ] Loading geometry is stable, and already available results are not delayed artificially.
- [ ] Routine motion is purposeful, brief, interruptible and replaceable; reduced-motion treatment retains useful feedback.
- [ ] Focus, native semantics and selection indicators that do not rely on color survive forced-colors and high-contrast treatment.

### Responsive and readable

- [ ] Long labels, text resizing, text-spacing overrides and narrow-window reflow preserve information and functionality.
- [ ] Filters, navigation and comparison remain meaningfully usable in compact layouts; capabilities available at larger widths do not silently disappear.
- [ ] The current field, resulting content and necessary actions are reachable by keyboard.
- [ ] Dialogs and sheets have clear scroll ownership, titles, dismissal behavior and focus return.
- [ ] Sticky layers, safe areas, browser interface elements and orientation changes do not cover content or focused controls.
- [ ] Color pairs, image overlays, focus states, numeric alignment and fallback-font behavior are checked in their final rendered combinations.

A grayscale or blur review can help reveal hierarchy defects, but it does not establish contrast compliance, accessibility or task success. Likewise, one screenshot cannot establish late font or media shifts, keyboard navigation or touch cancellation. Visual review, functional behavior and targeted accessibility and performance checks are complementary. [[1]](https://www.nngroup.com/articles/visual-hierarchy-ux-definition) [[3]](https://web.dev/articles/optimize-cls) [[5]](https://www.w3.org/TR/WCAG22/)

## 23. From reference to original interface

### Treat a reference as evidence, not as a picture

A screenshot is one rendered moment. It records one viewport, one content sample, one font and loading state, and often an unknown browser zoom level. Before implementation, create a reference inventory for every supplied capture. Record its source and ownership, captured location or region, visible viewport or aspect ratio, crop status, readable text, available assets, and known interaction context. Choose one primary reference as the structural backbone. Let secondary references inform only named axes, such as crop treatment or navigation density. A reference-study protocol likewise recommends diagnosing sources individually and choosing axes explicitly rather than blending several references into an undifferentiated result. This reduces the risk of producing a collage of unrelated conventions. [[99]](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/study.md)

Classify every inventory entry into four buckets:

- **Observed:** directly visible in the capture.
- **Provided:** known from supplied identity files, content, specifications, or assets.
- **Inferred:** the best available explanation of a layout or behavior.
- **Open:** not supported by enough evidence.

For example, alignment to a column rail is inferred unless the underlying layout specification is available. A capture width is observed only when the image dimensions are known. A narrow-screen drawer is a hypothesis, not a fact established by a wide-screen capture. Keep a small uncertainty ledger for every consequential assumption, including confidence and a validation route. Do not quietly turn a low-confidence font identification, hidden hover behavior, unseen empty state, or off-canvas interaction into fact.

The strongest transferable lesson from image-to-code guidance is to avoid vague analysis of visual mood. Inspect readable text, typographic relationships, line wraps, gutters, internal spacing, card rhythm, radius, stroke and shadow logic, button hierarchy, image treatment, grid structure, and repeated motifs systematically. An image-first sequence is not a universal law, but clear section and detail references usually support better analysis than a compressed board of many tiny images. If text or controls are too small to inspect, request a clearer supplied crop or record the uncertainty instead of inventing detail. [[100]](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/image-to-code-skill/SKILL.md)

### Decompose from macro to micro

Keep the analysis order stable. Fine polish cannot rescue an incorrect macrostructure:

1. **Task and content truth:** establish the screen's purpose, current state, allowed actions, and excluded capabilities from the product requirements and UX.md. A reference showing an action, form, or success state cannot override the product's actual scope.
2. **Macrostructure:** map the global shell, section sequence, dominant visual region, full-width and railed regions, columns, reading order, and scroll rhythm.
3. **Component anatomy:** divide navigation, search, cards, galleries, key value groups, filters, comparison rows, pending selections, and feedback into required and optional slots and states.
4. **Geometry:** estimate the outer rail, column proportions, media ratios, alignment axes, repeated gaps, baseline zones, and overlap relationships.
5. **Surface language:** identify type roles, color roles, borders, radii, shadows, icon weight, crop and grading treatment, and motion cues.
6. **Responsive hypotheses:** identify what may wrap, stack, scroll, collapse, substitute, or remain sticky. Check every proposal against task equivalence.

The purpose of geometry extraction is not false optical-character-recognition precision. Preserve relationships first. A finding such as "the heading-to-body gap is smaller than the card-to-card gap" is more useful than treating an estimated 31 px gap as immutable. Tune the implementation through rendered comparison. Image-to-code guidance also separates spacing logic from exact pixel extraction and treats stable media frames and repeated proportions as implementation-friendly evidence. [[100]](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/image-to-code-skill/SKILL.md) When capture dimensions are known, rough ratios and anchor coordinates can provide useful starting measurements, but they still require validation after browser rendering, font metrics, and cropping affect the result.

### Be honest about assets and fonts

Create an asset manifest for logos, imagery, icons, textures, and illustrations. For each asset, record the supplied file, license or provenance, intended role, intrinsic dimensions, permitted cropping, transparency, suitability for light and dark surfaces, and missing variants. Prefer existing owned assets. Do not copy another source's photography, logo, illustration, or signature iconography. Reference-study guidance explicitly treats structure as transferable and specific photography as non-transferable. Design-system packaging guidance also treats assets and provenance as concerns distinct from the token and component system. [[99]](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/study.md) [[101]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/README.md)

Do not conceal an image mismatch with filters, extreme zoom, or arbitrary cropping. First confirm that the correct file and variant are in use. Then decide between `contain` and `cover`, object position, background surface, and frame ratio. If an asset is a placeholder, make its sample status visibly honest rather than presenting it as final commissioned imagery. Any fictional claims, ratings, or other evidence must remain clearly labeled.

Identifying an exact font from a screenshot is unreliable. Describe the role first, such as a neutral grotesque for body copy, a condensed display face, or a monospace face for labels. Test candidate fonts for glyph and language coverage, available license and files, actual weights, numerals and symbols, fallback metrics, and line wrapping in the product's real languages. Reference-study guidance distinguishes font roles and candidates inferred from images from font names declared in source code. [[99]](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/study.md) If the exact family is unavailable, document a substitution with a similar character. Adjust kerning, line height, and width as needed, but do not claim that the substitute is the source font. Redesign guidance treats existing identity marks, color, typography, and photography as starting material, and recommends understanding the identity, audience, and restraint requirements before applying generic aesthetic preferences. [[42]](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/taste-skill/SKILL.md)

### Record responsive behavior as hypotheses

A wide-screen reference proves only its visible wide-screen composition. For every region, use a responsive hypothesis table while deriving narrower compositions:

| Field | What to record |
|---|---|
| Invariant meaning | Information, action, state, and relationship that must survive |
| Likely adaptation | Wrap, stack, scroll, collapse, substitute, resize, or sticky behavior |
| Evidence | What in the reference or requirements supports the proposal |
| Risk | Information loss, reordered meaning, obscured focus, overflow, or interaction cost |
| Check | Viewport, content stress case, input mode, and state needed to validate it |

A two-column detail composition may stack, a filter rail may become a drawer, and a comparison region may use scoped horizontal scrolling. However, selection state, labels, keyboard order, and recovery must not disappear. Derive breakpoints from actual content collisions, minimum readable component anatomy, and task pressure, not from a device label attached to the reference. Reference analysis does not approve a final breakpoint set.

A static capture does not prove hover, focus, loading, failure, sticky behavior, back navigation, reduced-motion behavior, or persistence of saved state. Do not interpret motion blur as an intended duration, a closed menu as the absence of a menu, or a clipped lower edge as the true end of a section. Reference-study guidance marks motion as not visible in screenshot analysis and acknowledges that source-only analysis can miss rendered rhythm. Apply the same evidentiary discipline. [[99]](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/study.md)

### Transfer the DNA, not the dress

Transferable **DNA** can include attention order, section rhythm, image-to-text ratio, contrast among type roles, accent footprint, boundary and elevation logic, and interaction density. Non-transferable dress can include a source wordmark, proprietary artwork, exact copy, signature motif, distinctive icon silhouette, and an identity-defining palette combination. Preserve useful familiar interface grammar, but rebuild its expression with owned assets, truthful content, and the behavior specified in UX.md.

Maintain a compact reference-decision ledger:

| Decision | Use |
|---|---|
| `preserve` | Keep a relationship or mechanism that fits the task and identity |
| `adapt` | Retain the purpose but change expression, content, density, or behavior |
| `replace` | Substitute owned assets, appropriate semantics, or a better task pattern |
| `omit` | Remove content or behavior that is unsupported, misleading, inaccessible, or out of scope |

Give every entry a reason. A layout balance might be preserved, an action adapted to an allowed task, source imagery replaced with licensed assets, and an unsupported completion state omitted. Reference-study methods diagnose macrostructure, component archetypes, type roles, color anchors, and rhythm instead of cloning pixels. They also warn against silently displacing established identity, content intent, information architecture, and recognizable patterns. [[102]](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/SKILL.md) Audit-first redesign guidance similarly preserves identity tokens, content blocks, recognizable patterns, and accessibility gains before changing visual expression. [[42]](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/taste-skill/SKILL.md)

Avoid a "pixel-perfect" promise. Prefer bounded acceptance language: intended composition and visual relationships are close at named viewports; key anchors align using owned assets and the chosen font; behavior, content resilience, and accessibility have been checked; remaining differences are listed. A screenshot can be a visual target, but it is neither product truth nor a behavioral specification.

## 24. Design libraries and a coherent original direction

### Use a reference corpus as a possibility space

A design-reference collection is not an answer key. It is a corpus for naming visual axes, comparing combinations, and detecting incoherent mixtures early. A useful corpus may include identity analyses, normalized token packages, contrasting template families, component references, and motion-oriented styles. Its purpose is not to make a product resemble an existing identity. Extract recognizable mechanisms, such as image-led hierarchy, a restrained accent, separate canvas treatments for expressive and task-heavy surfaces, or modest typographic weight. Do not take logos, signature colors, proprietary typefaces, campaign compositions, wording, or recognizable component silhouettes.

Corpus studies suggest several mechanisms worth testing as hypotheses. When imagery carries most of the visual weight, headlines may remain quieter and collections may tolerate greater density. Expressive surfaces and task-heavy surfaces can use different canvas polarity or density while sharing one semantic system. These are hypotheses for evaluation, not settled styling. [[103]](https://raw.githubusercontent.com/VoltAgent/awesome-design-md/8147538b4226ae41e2487a9179e3bcc1f68e8554/design-md/airbnb/DESIGN.md) [[104]](https://raw.githubusercontent.com/VoltAgent/awesome-design-md/8147538b4226ae41e2487a9179e3bcc1f68e8554/design-md/shopify/DESIGN.md)

Visual references are not UX evidence. A polished library file does not prove comprehension, conversion, accessibility, or suitability for varied content. UX.md remains the primary authority for behavior, including navigation, search, comparison, selection editing, saving, removal, reversal, and product capability boundaries. UI references give those behaviors a visual grammar. Repeated identical token files in an archive are not independent validation or evidence of use by several successful products. They may come from a shared generator, common default, or copied package. Do not treat repetition as a vote.

### Compare axes before naming styles

Place each candidate direction in the same extraction matrix:

| Axis | What to record | Universal product test |
|---|---|---|
| Atmosphere | 3 to 5 adjectives, each tied to visible evidence | Does the tone unify varied content, or costume the whole product for one content type? |
| Hierarchy carrier | Imagery, display type, key data, or surface contrast | Does attention reach identity, evidence, and the next action in the intended order? |
| Type system | Display, body, numeric, and metadata roles, plus fallback behavior | Do long names, supported languages, symbols, and tabular values remain usable? |
| Color system | Canvas, surface, ink, accent, focus, and feedback | Are identity actions distinct from semantic error, warning, and success states? |
| Density | Macro whitespace, card gaps, row height, and compact mode | Are exploration, filtering, comparison, and editing forced into one density? |
| Geometry | Corners, borders, depth, and media crop | Are grouping and affordance clear without excessive decoration? |
| Motion | State feedback, entrances, and continuity | Does motion explain state, and does meaning remain under reduced motion? |
| Components | Cards, fields, chips, drawers, tables, and feedback | Are real states covered, or are only banners and buttons polished? |
| Adaptation | Narrow width, touch, forced colors, and long content | Is the direction a robust interface rather than a wide-screen poster? |
| Provenance | Observed, curated, generated, or inferred | Does confidence remain proportional to evidence? |

Write exact visible evidence beneath every mood label. "Premium" alone is not a direction. A description such as "quiet sans serif, image-led cards, low elevation, one action accent, and comfortable exploration spacing" can be reviewed. A visual-style reference likewise translates atmosphere into palette, typography, composition, and motion. The useful lesson is the descriptor-to-decision method, not any context-specific rendering recipe. [[105]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-templates/hyperframes/visual-styles.md)

### Use visual families as comparison vocabulary

The following families are neither approved categories nor mutually exclusive presets:

- **Editorial and warm paper:** expressive display typography paired with a readable workhorse body, structured or asymmetric grids, fine rules, and whitespace. This can give narrative introductions and curated collections character, while dense controls, summaries, and comparison rows usually need a simpler utility tier. Editorial references use typography and composition as primary carriers. Warmer variants add a paper-like canvas, restrained depth, and limited accent. Exact fonts, prominent-region heights, and accent limits remain contextual recipes. [[106]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-systems/editorial/DESIGN.md) [[107]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-systems/warm-editorial/DESIGN.md) [[108]](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/genres/editorial.md)
- **Neutral and productive:** a quiet canvas, predictable grid, restrained borders, clear controls, and low-drama motion provide a robust baseline for search, record views, and editing flows. If personality stops at "clean," the result may feel generic. Develop character through image framing, typographic details, icon voice, and spacing cadence. A modern-minimal reference presents same-family typography, generous whitespace, and subtle surfaces as one coherent approach, not as a requirement for pill shapes or monochrome treatment. [[109]](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/genres/modern-minimal.md)
- **Dense and data-forward:** compact spacing, strong row alignment, tabular numerals, clear panels, and restrained status signaling can support matrices, technical records, and quantitative summaries. Do not impose an operations-monitoring costume on narrative or image-led areas. Data-oriented references coordinate readouts, panel hierarchy, compact baselines, and explicit status colors. All-monospace copy, permanently dark surfaces, and alert-heavy motion can be rejected when the task does not justify them. [[110]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-systems/mission-control/DESIGN.md)
- **Warm, tactile, and soft:** cream or gently tinted surfaces, humane typography, soft edges, restrained depth, and calm feedback can add warmth. Applying nested bezels, very large radii, and ambient motion to every card can make scanning laborious. Soft references often couple concentric geometry and motion tightly. Adopt a useful mechanism selectively rather than pasting an entire template into the product shell. [[111]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-templates/web-prototype-taste-soft/SKILL.md) [[112]](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/genres/playful.md)
- **Bold, brutalist, and print-led:** a hard grid, high-contrast type, visible rules, compressed metadata, and low-radius geometry can energize a campaign or isolated editorial band. Forcing ordinary titles, controls, and comparative values into very large uppercase or decorative syntax damages readability. Industrial references recommend commitment to one substrate rather than mixing it with an incompatible display metaphor. The transferable lesson is coherent commitment, not a prescribed color or zero-radius rule. [[113]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-templates/web-prototype-taste-brutalist/SKILL.md) [[114]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-systems/brutalism/DESIGN.md)
- **Dark, technical, and atmospheric:** dark surfaces, a controlled luminous accent, monospace metadata or precise sans serif type, and depth created through surface lightness can frame technical or media-rich experiences. They should become a product-wide default only after text, imagery, forms, and use under varied ambient light are validated. Atmospheric references may treat centered compositions and glows as contextual exceptions, while dense technical references use function-first panels. Both are dark, but they are not interchangeable. [[115]](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/genres/atmospheric.md) [[110]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-systems/mission-control/DESIGN.md)
- **Glass, luminous, and soft effects:** translucency, blur, luminous edges, and layered surfaces can communicate real depth in an overlay or sticky utility region. Using translucency for every repeated card can make contrast, image color, and hierarchy unstable. A glass-oriented package combines its effect with typography, spacing, and state scaffolding, which shows why an isolated visual effect is not a complete theme. [[116]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-systems/glassmorphism/DESIGN.md)

Centered layout, gradients, serif or monospace type, pill or square corners, cards, and shadows are not intrinsically good or bad. Reference families permit each in one context and reject it in another. Resolve conflicts through content, task, accessibility, and performance rather than a vote on taste.

### Compare directions with representative content

Develop two or three genuinely different hypotheses, not color swaps. Test each with the same representative content: long and short names; image-light and image-heavy records; selected filters; comparison rows; value editing, removal, and reversal; and empty, loading, and error states. Label fictional claims as samples. Do not introduce forms, success states, personal-data collection, or commitments that the product does not support.

A small contact sheet can cover global navigation and search, one representative card row, a filter state, a detail summary, a comparison slice, an editable row, and one overlay. Score each direction on:

1. **Task clarity:** how quickly users can locate identity, key values, selected state, and the next local action.
2. **Content range:** whether the same grammar supports varied content without flattening meaningful differences.
3. **Content resilience:** behavior with long localized text, missing imagery, sample labels, and variable metadata.
4. **Accessibility resilience:** focus, contrast, zoom, reduced motion, forced colors, touch, and coarse-pointer paths.
5. **System cost:** the number of special cases, one-off values, and content-specific overrides required.
6. **Originality:** whether the result feels specific without a recognizable borrowed signature.

The guide should not declare a winner without product evidence. Record evidence-based tradeoffs and unresolved choices. A richly tinted system or a photograph-led hierarchy is a mechanism to study, not permission to copy a proprietary face, exact accent, or recognizable component silhouette. [[117]](https://raw.githubusercontent.com/VoltAgent/awesome-design-md/8147538b4226ae41e2487a9179e3bcc1f68e8554/design-md/notion/DESIGN.md) [[103]](https://raw.githubusercontent.com/VoltAgent/awesome-design-md/8147538b4226ae41e2487a9179e3bcc1f68e8554/design-md/airbnb/DESIGN.md)

### Adapt a template by taking its grammar, not its shell

Use three passes:

1. **Preserve the task skeleton:** keep the established locations, information order, labels, and state transitions.
2. **Map the visual grammar:** map the template's canvas, ink, accent, type roles, spacing cadence, radius, depth, and motion to semantic tokens.
3. **Remove template residue:** delete irrelevant banners, invented proof statistics, unsupported forms, decorative data panels, identity-specific navigation, and unsupported commitment actions.

General template guidance similarly recommends mapping seed tokens to the active design system and replacing an unsuitable section rather than forcing content into the wrong slot. Apply that principle at both component and screen level. [[118]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-templates/web-prototype/SKILL.md)

Strong visual templates are internally coupled. Their typography, substrate, geometry, and motion reinforce one another. Combining warm paper from one family, double-bezel cards from another, warning-like rules from a third, and translucent navigation from a fourth is not the best of each. It is a collage of competing metaphors. Choose one primary grammar and permit one restrained secondary modulation. An expressive band may be more editorial while controls remain productive, but semantic states, icon family, focus treatment, and component anatomy should stay common. Editorial and brutalist references make these coupled bundles especially visible. [[119]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-templates/web-prototype-taste-editorial/SKILL.md) [[113]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-templates/web-prototype-taste-brutalist/SKILL.md)

### Declare theme scope and migrate deliberately

Declare whether a theme is a **global product theme**, **light and dark mode**, **content-specific art-direction layer**, or **temporary campaign skin**. A content-specific layer must not silently replace global action colors or feedback semantics. Dark mode can change primitive values, but role names, state distinctions, information hierarchy, and component anatomy must remain stable. Expressive and task-heavy surfaces may differ in canvas or density, but shared navigation, search, selected states, and focus behavior must not become two unrelated systems.

Migration is not a single replacement of color literals. First inventory current literals as primitives. Introduce semantic aliases. Move shared components to those aliases, then migrate one-off screens. Finally remove dead primitives and unused component tokens. Keep any temporary compatibility alias under explicit deprecation. At every step, compare a representative contact sheet and state matrix. Check fallback metrics and wrapping during typography migration, paired surfaces during color migration, nested clipping during geometry migration, and sticky and overflow behavior during spacing migration. An audit of declared tokens against referenced tokens is useful because a theme can appear technically complete while a critical state token remains unused or hard-coded. [[97]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-systems/editorial/components.manifest.json)

Until the direction is finalized, all values remain illustrative. This analysis does not fix a final palette, font, radius, breakpoint, content count, capitalization scheme, or motion duration. Even once chosen, a visual theme cannot override UX behavior or accessibility semantics.

## 25. Component sourcing, library evaluation, implementation craft and browser review

### Treat catalogs and generators as candidate sources

An available component catalog, generator, or design library can accelerate exploration, but it is not an authority on correctness. Search by the component's job, technology constraints, layout, content density, required states, accessibility, and theme requirements, not only by visual adjectives. Compare two or three candidates against anatomy and behavior. Do not make a polished preview the automatic winner. Catalog tooling may offer search, previews, metadata, source, variants, themes, templates, and adaptation to local conventions, but actual capabilities depend on the current version and connection. Do not treat legacy tool names or package marketing as a stable contract. [[120]](https://raw.githubusercontent.com/21st-dev/magic-mcp/6e5a43d3621442a450948864a74396d206b23c65/skills/21st-ui/SKILL.md) [[121]](https://raw.githubusercontent.com/21st-dev/magic-mcp/6e5a43d3621442a450948864a74396d206b23c65/README.md)

Reusable skills, templates, systems, components, assets, and canonical files may be separate composable planes. That separation can be useful, but a large catalog does not establish suitability, approval, or authenticity. Inspect package provenance and licensing. Never relabel a third-party identity system as an original one. Treat a catalog component as a starting candidate: remove unnecessary sections and states, connect the product's behavioral contract, adapt tokens, and inspect the result in an actual browser. If external tooling is unavailable, apply the same evaluation criteria to local primitives. Installation, an API key, or platform setup is not inherently required. [[101]](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/README.md)

### A universal component-library evaluation framework

Evaluate every candidate through all of the following gates:

1. **License, redistribution, and attribution:** identify the source, exact version, license, modification rights, commercial-use constraints, redistribution terms, and required attribution. A page labeled free is not necessarily covered by a verified open-source redistribution license. Paid access does not grant blanket permission for third-party logos, photographs, videos, fonts, or other bundled media. Confirm rights for source code, dependencies, and sample assets separately. Handle any required credit deliberately.
2. **Actual availability:** confirm whether usable source or an installable package is actually available. A preview may depend on paid access, an unlocked account, a network service, or exports that differ from documentation. Verify obtained export names and files rather than assuming that examples match the installed version.
3. **Accessibility of shipped components:** test keyboard operation, visible focus, focus order, focus trapping and return for overlays, accessible names, roles, labels, headings, expanded and selected semantics, and screen-reader announcements. Confirm default, hover, pressed, selected, disabled, loading, empty, and error states. Avoid unnecessary announcements, including announcing every frame of a numeric animation. Native elements remain the preferred baseline where they provide the required semantics.
4. **Customization through tokens and contracts:** determine whether colors, type, spacing, geometry, elevation, motion, and states can map to semantic tokens and supported properties. Reject or heavily adapt a component that imposes a hard-coded borrowed identity. Consumer classes and attributes must merge or forward deliberately without duplicate handlers, invalid properties, or hidden focus treatment.
5. **Dependencies, weight, and runtime cost:** inspect direct and transitive dependencies, duplicated animation packages, icon, font, and media requests, bundle and parse cost, layout measurement, per-instance listeners, cleanup, and rendering work. A published dependency summary is not a complete bundle audit. Do not add a large motion layer for a minor underline or icon response when a local implementation can do the job.
6. **Server rendering and hydration:** verify that output is deterministic between server and browser, that generated identifiers and state do not cause hydration mismatches, and that browser-only APIs are guarded. Test whether layout measurement, portals, media queries, reduced-motion detection, and initial animation alter the first rendered structure or produce visible jumps. Do not infer compatibility from a preview page.
7. **Mobile and touch behavior:** test narrow widths, long labels, coarse pointers, tapping, scrolling, dragging, selection, dismissal, and on-screen keyboards. Hover may enhance an interaction but cannot be the only route to essential information. Custom cursors, drag-only controls, and tiny moving targets need a complete touch alternative.
8. **Reduced motion and progressive enhancement:** useful content and controls must work without the effect. Motion may reduce or stop without hiding content or changing meaning. Test both an initial reduced-motion preference and a preference change while the page is open. Avoid treating canvas effects, scroll-linked animation, custom carets, or custom numeric inputs as blind replacements for native behavior.
9. **Browser coverage:** define supported browsers and test the obtained component in each, including Safari rather than inferring Safari support from another browser. Pay particular attention to CSS masking and fading, sticky and overflow combinations, focus rings near clipped regions, viewport units, media behavior, font rendering, and hydration. A test that excludes Safari, Firefox, physical touch hardware, or screen-reader speech must say so and cannot certify those contexts.
10. **Maintenance and versioning:** record the adopted version, update policy, source ownership, release activity, breaking-change history, and the ability to maintain checked-in code if the catalog or network becomes unavailable. Confirm that documentation, exports, dependencies, and observed behavior match the obtained version.
11. **Adoption scope:** prefer selective use over wholesale adoption. Keep a component only when it offers a clear task benefit over a plain primitive. A simple owned link, hint, disclosure, or state icon can be better than importing an entire effect collection. Do not invent a feature merely because a library contains a component for it.
12. **Verification in the actual product:** every adopted component must be tested in the real product composition across content states, interaction states, viewports, input modes, themes, and supported browsers. Never trust a preview page as evidence of integration quality, accessibility, performance, or compatibility.

Library evaluation should preserve an explicit evidence boundary. A shortlist is a recommendation for further evaluation, not a final selection or tested implementation. Availability of a detail page and preview proves only retrieval. Published symbols and dependencies are metadata, not proof of installed exports or bundle cost. A locally recreated interaction can validate an idea without certifying the publisher's source. Keep concept fit, source licensing, implementation quality, and integration evidence as separate gates.

### Apply utility-first adoption rules

For every proposed adoption, write one sentence answering: **Which task becomes clearer?** Visual novelty alone is insufficient. A hint can explain an unfamiliar control, a state icon can reinforce a real state, and an overflow cue can reveal continuation. Movement without additional meaning does not make a collection more useful.

Use one coherent visual language. Align adopted components with existing typography, semantic colors, spacing, corner geometry, icon family, and focus treatment. Independent previews in a catalog do not form one product design system.

Treat attention as a budget, not an animation quota. Dense collections, filtering, comparison, and editing should remain quiet by default. If one region has an expressive moment, reduce competing movement nearby. This is contextual guidance, not a fixed number of effects or a universal duration.

Visible feedback must be driven by real state. Animation cannot repair an incorrect count, inconsistent total, broken keyboard path, or failed reversal. A reversal must restore the exact prior entity, option, and value. Never disguise pending or failed state with motion that looks successful.

Content must win over effects. Names, selected options, availability or status context, key numeric attributes, and important differences must remain readable. Do not crop, mask, or distort media in ways that misrepresent the represented object or its included contents. Hover is an enhancement, not the only means of revealing essential detail.

Several common patterns require narrow justification:

- Animate a number only for a genuine changing value. Counts, quantities, and totals must reconcile to one state, without stale digits, random values, or artificial urgency. Plain numbers are a valid default.
- A custom numeric input must outperform a native input with increment and decrement controls under typing, selection, bounds, disabled state, and rapid editing.
- An accordion's disclosure grammar can be useful, but pronounced bounce is optional. Semantic headings and buttons, expanded state, focus, and reduced-motion behavior come first.
- A media player is justified only when real, appropriately licensed media exists. Review a large stationary play target, captions, usable native controls, overlay dismissal, and focus return before adding cursor-following controls.
- Carousel or expandable-card patterns may support optional narrative content. Do not hide primary factual content or comparison behind perspective, flipping, masking, drag-only controls, or automatic rotation. Choose one suitable pattern rather than a different carousel for every section.
- Overflow fades must appear only while content continues in that direction. Keep the fade outside text and focus rings where possible, provide a useful fallback, and do not assume a vertical treatment also solves horizontal comparison.
- Animated icons should follow real state and keep visible labels and accessible names synchronized. Omit continuous hover entertainment, repeated bounce, or fictional loading.
- Tooltips are appropriate only for genuinely optional explanation. Keep required facts inline. Test focus triggering, dismissal, touch fallback, placement, and accessible naming.

Artificial preload waits, staged page reveals, cursor trails, mouse-following spectacles, full-page parallax, pinned stacks, dramatic scroll choreography, and complex three-dimensional scenes usually impose attention, access, and performance costs that require exceptional task value. Development overlays and breakpoint tools may assist implementation but must not leak into the user interface. Exclusion does not imply that a component is poor quality. It means its cost or attention footprint exceeds its utility in the current context.

### Build components as semantic contracts

Constructing an entire screen as one monolith can produce a fast first frame, but it increases drift during iteration. Build shared shells and rails and semantic primitives first, then compose screens. Define components as content and state contracts rather than screenshot-shaped rectangles. A repeated item may expose separate media, identity, key-value, selection, save, and unavailable-state slots rather than spawning slightly different private copies on every screen.

Use native semantic elements to preserve browser behavior. Use links for navigation, buttons for actions, explicit labels for controls, proper table semantics for tabular relationships, and native semantics before adding ARIA. [[98]](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/e3d624baaf29dc1fc645aff3e38f03e564d2d6b1/AGENTS.md)

Implementation craft includes:

- Keep document order meaningful under both the visual reading order and compact reflow.
- Use stable data keys so identity survives reorder, removal, and reversal.
- Merge and forward consumer classes, attributes, and event handlers deliberately.
- Scope component CSS. Share meaning through global tokens, not accidental global selectors.
- Handle flex and grid shrinking, `min-width: 0`, intrinsic media ratios, and text wrapping explicitly.
- Name transition properties. Avoid broad `transition: all` and avoid animating layout properties when a compositor-friendly alternative exists.
- Preserve the same state meaning under reduced motion.
- Make focus rings immediate, visible, and unobscured by sticky layers.
- Keep focus, selected, and disabled treatments semantically and visually distinct.

Implementation guidance supports explicit transitions, compositor-friendly motion, resilience to varying content length, deliberate alignment, review at mobile, laptop, and very wide sizes, and coverage of empty, sparse, dense, and error states. [[98]](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/e3d624baaf29dc1fc645aff3e38f03e564d2d6b1/AGENTS.md) Preflight work should inspect existing dependencies, tokens, technology constraints, and identity signals. Individual preferences for a library or font remain contextual opinions, not universal rules. [[42]](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/taste-skill/SKILL.md)

### Make browser review deterministic

Visual comparison is meaningful only when the state is reproducible. Record the location, fixture or content state, viewport width and height, device scale when relevant, color scheme, font readiness, reduced-motion preference, locale, and capture time or state. Use stable fixtures or seed paths for reversible local interactions. Do not require real credentials, personal information, financial details, or irreversible commitments merely to review a component. Distinguish a fresh baseline from intentionally persisted state by using separate sessions or profiles.

Named browser sessions may isolate cookies, local and session storage, IndexedDB, cache, history, and tabs. Storage-state files can contain sensitive information, so minimize their scope, protect them, and avoid authenticated state when it is unnecessary. [[122]](https://raw.githubusercontent.com/microsoft/playwright-cli/655530f6d0dc71a0d6bf46ae165877d3c7311099/skills/playwright-cli/references/session-management.md) [[123]](https://raw.githubusercontent.com/microsoft/playwright-cli/655530f6d0dc71a0d6bf46ae165877d3c7311099/skills/playwright-cli/references/storage-state.md)

When browser automation exists, begin exploration with an accessibility snapshot and target controls by role and accessible name. An ephemeral snapshot reference can support exploration. Durable checks should use user-facing roles and labels, or a genuinely stable test identifier when no semantic locator fits. Deep CSS chains break when visual markup changes. Test-generation guidance treats semantic locators as more resilient, warns that actions do not automatically create assertions, and requires explicit expectations for observable outcomes. [[124]](https://raw.githubusercontent.com/microsoft/playwright-cli/655530f6d0dc71a0d6bf46ae165877d3c7311099/skills/playwright-cli/references/test-generation.md)

Use pinned viewport screenshots for comparison, but do not create an arbitrary device collection for every named breakpoint. Choose representative wide, laptop, and compact widths from actual content pressure. The exact set is contextual. Ensure fonts are ready, animations are settled or reduced, image state is known, and carets and transient overlays are controlled. Capture both the full composition and focused regions in the same state, such as navigation and search, one representative repeated row, a detail summary, comparison headers and rows, an editable line, and reversal feedback. Keep filenames and state metadata readable. Browser tooling can support viewport resizing, element and page screenshots, snapshots with bounding boxes, semantic locators, highlighting, and trace capture, but those capabilities do not themselves certify quality. [[125]](https://raw.githubusercontent.com/microsoft/playwright-cli/655530f6d0dc71a0d6bf46ae165877d3c7311099/skills/playwright-cli/SKILL.md)

### Verify behavior alongside screenshots

A screenshot cannot establish that saving updates state, edited values remain coherent, keyboard focus is visible and correctly returned, filters survive back navigation, or the reduced-motion alternative works. Pair every important action with an observable assertion:

- After saving or unsaving, assert the named state or label.
- After removal, assert that the entity is absent and reversal is available.
- After reversal, assert that the same entity, option, and value return.
- After a value change, assert agreement between the line and its summary.
- After comparison selection, assert agreement between the selected cards and count.
- After filtering, assert that visible results, active-filter count, and native control states derive from the same selection.
- After expanding a disclosure, assert agreement among `aria-expanded`, the visible label or icon, and the controlled content.
- For an in-page destination, assert that the destination is correct, focusable when needed, and visibly focused.

Combine visual assertions with semantic state, text, value, URL, or accessibility snapshot assertions. Browser testing guidance documents visibility, text, value, checked-state, and partial accessibility-tree assertions. Restricting assertions to a relevant subtree can reduce unrelated volatility. [[124]](https://raw.githubusercontent.com/microsoft/playwright-cli/655530f6d0dc71a0d6bf46ae165877d3c7311099/skills/playwright-cli/references/test-generation.md)

Run a separate keyboard pass across skip links, search, filters, repeated-item actions, dialogs or sheets, horizontal comparison, editing, and reversal. Never infer keyboard success from a pointer-hover screenshot. In a reduced-motion pass, remove long travel, parallax, and zoom while retaining selected borders, immediate status, and focus feedback. Test both initial preference and live preference changes where supported. In narrow-width review, inspect page-level horizontal overflow, sticky overlap, long names, large numeric values, missing-image fallbacks, and text resizing.

When comparing an effect with a plain baseline, hold content, state logic, dimensions, destinations, and disclosure meaning constant. The baseline must remain fully usable without the effect. Exercise the same actions in both versions, including keyboard activation, selection and clearing, scrolling to the start, middle, and end, reaching off-screen controls by focus, opening and closing disclosures by keyboard and touch, narrow reflow, long labels, and reduced motion. This is an engineering comparison, not proof of user preference, conversion improvement, or usability gains. Keep results limited to the exact contexts tested. A single browser pass is not comprehensive certification, touch emulation is not a physical-device test, source inspection is not a second browser pass, and untested screen-reader speech, forced colors, browsers, and performance must remain explicit limitations.

A focused trace can help diagnose failures by combining document snapshots before and after actions, screenshots, action timing, and network evidence. It can reveal more causes than a single frame, but it adds storage and processing overhead and dynamic replay is not perfect. [[126]](https://raw.githubusercontent.com/microsoft/playwright-cli/655530f6d0dc71a0d6bf46ae165877d3c7311099/skills/playwright-cli/references/tracing.md) Do not archive a large trace for every routine review. Capture a scoped trace for a specific intermittent focus problem, late font or media load, incorrect state transition, or click interception.

### Classify findings and make the smallest credible fix

Do not record a visual finding as "polish more." Include the location, state, viewport, expected relationship, observed difference, evidence capture, and severity:

- **P0 boundary or truth:** a false completion state, unsupported collection of sensitive information, broken critical action, inaccessible blocker, or false commitment state. This is a release-boundary issue.
- **P1 task or accessibility:** a hidden primary action, obscured focus, inconsistent summary truth, unreadable contrast, missing destructive-action recovery, or unusable narrow layout.
- **P2 hierarchy or responsive composition:** incorrect attention order, important alignment, crop, or font-wrap drift, persistent overflow, or visually ambiguous component states.
- **P3 polish:** an isolated optical adjustment, nonessential shadow or radius nuance, or minor low-salience rhythm difference.

Resolve P0 and P1 findings first. Fix the smallest layer that addresses the root cause. Do not mask an incorrect asset with padding, change a global spacing token for one card anomaly, or fork a component-wide selected state through a page-specific override. Diagnose selector specificity, font loading, container width, content growth, state logic, and asset cropping before changing style. After one focused change, recapture and recheck the affected region and one neighboring regression surface. Avoid reflexively redesigning the whole screen.

Keep final claims proportional to the evidence. Say that no page overflow was observed at a named compact viewport, not that the interface is fully responsive. Say that keyboard paths were checked for listed flows, not that accessibility is certified. Say that key visual anchors closely match the agreed reference, not that the implementation is pixel-perfect. A pre-release critique and an evidence-led reference diagnosis are useful, but neither a score nor a screenshot proves readiness. [[102]](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/SKILL.md) A credible readiness threshold is truthful behavior, original visual expression, functional key states, reproducible browser evidence, closure of high-severity findings, and an explicit record of remaining uncertainty.

## 26. Evidence coverage and remaining choices

### From collected material to usable guidance

This guide combines several kinds of evidence without treating them as interchangeable. Academic work on visual perception informs claims about attention and hierarchy, including findings that originated in older or context-specific studies. Accessibility thresholds come from standards and retain the requirements, levels and exceptions of those standards. Public usability research contributes observed interface problems and practitioner recommendations. Browser documentation and mature design-system guidance contribute implementation-facing behavior, responsive resilience, stable layout, semantics, focus handling and token conventions. Practitioner corpora add craft corrections, component mechanics, motion guidance, visual direction vocabulary, methods for decomposing references and browser-review practices.

The material was deduplicated by source identity and exact-content matching. Where direct, version-pinned source documents were available, they took precedence over older rendered copies. Token files, repeated specimens and style templates were inspected as families rather than treated as independent validation of every named palette or convention. Practical guidance was derived through focused reading of topic-specific source text and representative design documents.

Indexing, structured scanning and full reading are distinct activities. This guide does not claim that every archived word was individually read or that every recommendation was independently tested. Metadata-only and reference-only records are not treated as though unavailable full text had been examined. Source indexes establish discovery and provenance, not complete evidentiary coverage of every page they list.

### What each evidence family supports

| Evidence family | Contribution to this guide | Boundary |
|---|---|---|
| Accessibility standards | Contrast, resizing, reflow, text-spacing resilience, target-size criteria, focus visibility and alternatives to dragging | The complete normative wording and exceptions remain authoritative; a summary is not certification |
| Academic visual-perception research | Foundations for attention, grouping and visual hierarchy | Older studies and measured exposure conditions should not be converted into predictions about a particular product |
| Public usability research | Findings about presentation consistency, comparison, readable content and common interaction failures | Findings from a measured domain or sample support careful generalization, not guaranteed outcomes elsewhere |
| Official browser documentation | Layout stability, rendering behavior and implementation-visible quality | Documentation explains platform behavior, but does not verify a future implementation |
| Mature design-system guidance | Typography, spacing, semantic tokens, component states and consistency patterns | A system's scale, palette, columns and conventions are examples, not automatically the right product choices |
| Practitioner playbooks and design corpora | Small craft corrections, component details, motion checks, visual authorship, composition vocabulary and constrained style choices | Collections provide candidates and comparative language, not automatic correctness or independent validation |
| Reference decomposition and browser observation methods | Measurement, uncertainty handling, visual comparison and review of rendered behavior | A captured view documents one condition; it cannot certify interaction, accessibility, performance or usability |

The relevant practical sections state where these contributions apply, and numbered citations lead to the collected evidence. The guide does not treat a benchmark, screenshot study or style collection as a forecast of business or behavioral outcomes. A visual composition cannot establish a usability result, and a screenshot cannot certify interactive behavior, accessibility or performance. A source recommendation also cannot approve a capability, workflow or claim that the product does not actually support.

### Choices that remain product-specific

Every team must still decide:

- brand direction, including visual character, art direction, exact fonts, palette, themes, corner language and effect restraint;
- density mode, including card density, spacing compression, information order and the amount of content visible at once;
- motion intensity, including which transitions exist, how strongly they attract attention and how reduced-motion treatment preserves feedback;
- responsive breakpoints, grid behavior, comparison limits and target-device priorities;
- audience assumptions, content model, collection size and the distinctions that must remain visible;
- the exact balance between expressive display treatment and efficient task completion.

These decisions must be tested against actual content and implementation conditions. Browser behavior, keyboard operation, viewport changes, font glyph coverage, image truth, composite contrast and every component state require verification in the chosen implementation. Academic findings, standards summaries and practitioner recommendations do not imply a usability study, conversion experiment or accessibility certification for a particular product.

This guide prescribes no specific stack or library. Its role is to help teams make behavior described in `UX.md` readable, original, consistent and resilient. A clear user decision is more valuable than reproducing an isolated source's preferred visual effect.

## 27. Sources

Numbered in order of the original research register, pruned to the sources cited in this edition. Dates are the publication or retrieval dates recorded at research time. A repository or tool reference is practitioner or tool material, not peer-reviewed evidence; academic and standards sources are identified by their titles.

1. [Visual Hierarchy in UX: Definition](https://www.nngroup.com/articles/visual-hierarchy-ux-definition), 2021-01-17; Retrieved page/document.
2. [2 Key Design Principles for Product Listing Information (64% Get at Least 1 Wrong)](https://baymard.com/blog/list-item-design-ecommerce), 2023-08-22; Retrieved page/document.
3. [Optimize Cumulative Layout Shift](https://web.dev/articles/optimize-cls), 2025-02-07; Retrieved page/document.
4. [The role of visual complexity and prototypicality regarding first impression of websites: Working towards understanding aesthetic judgments](https://static.googleusercontent.com/media/research.google.com/en/us/pubs/archive/38315.pdf), 2012; Retrieved page/document.
5. [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/), 2024-12-12; Retrieved page/document.
6. [The Principle of Common Region: Containers Create Groupings](https://www.nngroup.com/articles/common-region/), 2020-07-12; Saved search excerpt.
7. [Avoid These 5 Types of E-Commerce Graphics](https://baymard.com/blog/avoid-these-ecommerce-graphics), 2014-03-04; Retrieved page/document.
8. [2x Grid: Overview](https://carbondesignsystem.com/elements/2x-grid/overview), Publication date unavailable; Saved search excerpt.
9. [Spacing: Overview](https://carbondesignsystem.com/elements/spacing/overview), Publication date unavailable; Saved search excerpt.
10. [Typography, Material Design 3](https://m3.material.io/styles/typography), Publication date unavailable; Saved search excerpt.
11. [Typography, Carbon Design System](https://v10.carbondesignsystem.com/guidelines/typography/overview), Publication date unavailable; Retrieved page/document.
12. [Readability: The Optimal Line Length](https://baymard.com/blog/line-length-readability), 2022-05-10; Saved search excerpt.
13. [Best practices for fonts](https://web.dev/articles/font-best-practices), 2022-10-04; Retrieved page/document.
14. [How to display Indian rupee symbol?](https://kb.itextpdf.com/itext/how-to-display-indian-rupee-symbol), Publication date unavailable; Saved search excerpt.
15. [Number and currency patterns](https://cldr.unicode.org/translation/number-currency-formats/number-and-currency-patterns), Publication date unavailable; Saved search excerpt.
16. [font-variant-numeric CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variant-numeric), Publication date unavailable; Saved search excerpt.
17. [Product Page UX: Provide at Least One 'In Scale' Image](https://baymard.com/blog/in-scale-product-images), 2017-05-30; Retrieved page/document.
18. [Always Show the Number of User Ratings in List Items](https://baymard.com/blog/user-perception-of-product-ratings), Publication date unavailable; Saved search excerpt.
19. [Always Use Thumbnails to Represent Additional Product Images (76% of Mobile Sites Don’t)](https://baymard.com/blog/always-use-thumbnails-additional-images), 2020-10-20; Retrieved page/document.
20. [Make All Color Swatches Available in Mobile List Items for Visually Driven Product Types (57% Don’t)](https://baymard.com/blog/mobile-interactive-color-swatches), Publication date unavailable; Saved search excerpt.
21. [5 Requirements for the ‘Ratings Distribution Summary’](https://baymard.com/blog/user-ratings-distribution-summary), 2017-08-08; Saved search excerpt.
22. [Combobox Pattern | ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/combobox), Publication date unavailable; Retrieved page/document.
23. [Applying layout - Material Design 3](https://m3.material.io/foundations/layout/applying-layout/window-size-classes), Publication date unavailable; Retrieved page/document.
24. [Product Comparison UX: Always Provide Comparison Features for Spec-Driven Industries (17% Don't)](https://baymard.com/blog/provide-comparison-features), 2022-09-06; Retrieved page/document.
25. [Use Buttons or Buttons Plus an Open Text Field for Updating Cart Quantity (61% Don’t)](https://baymard.com/blog/auto-update-users-quantity-changes), 2022-09-20; Retrieved page/document.
26. [env() CSS function - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env), 2026-08-04; Retrieved page/document.
27. [<length> CSS type - MDN Web Docs - Mozilla](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length), Publication date unavailable; Saved search excerpt.
28. [Bottom sheets - Material Design 3](https://m3.material.io/components/bottom-sheets/overview?hl=en), Publication date unavailable; Saved search excerpt.
29. [Understanding SC 2.4.11: Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), Publication date unavailable; Saved search excerpt.
30. [Tabs Pattern | ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/tabs), Publication date unavailable; Saved search excerpt.
31. [forced-colors CSS media feature - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors), 2026-04-20; Retrieved page/document.
32. [Icon Usability](https://www.nngroup.com/articles/icon-usability/), 2014-07-27; Retrieved page/document.
33. [The Role of Animation and Motion in UX](http://nngroup.com/articles/animation-purpose-ux), Publication date unavailable; Saved search excerpt.
34. [prefers-reduced-motion CSS media feature - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion), Publication date unavailable; Saved search excerpt.
35. [Provide a Hover Delay of 300-500 MS for Hover-Based Drop-Down Menus (60% Don’t)](https://baymard.com/blog/dropdown-menu-flickering-issue), Publication date unavailable; Saved search excerpt.
36. [Design Tokens Format Module 2025.10](https://www.designtokens.org/TR/2025.10/format), 2025-10-28; Retrieved page/document.
37. [Ecommerce Category Pages: Definition, Usage, & Design Tips](https://baymard.com/learn/ecommerce-category-page), Publication date unavailable; Saved search excerpt.
38. [impeccable, pbakaus](https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/SKILL.src.md), Collected skill reference.
39. [bolder, pbakaus](https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/reference/bolder.md), Collected skill reference.
40. [layout, pbakaus](https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/reference/layout.md), Collected skill reference.
41. [brandkit](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/brandkit/SKILL.md), Collected skill reference.
42. [design-taste-frontend](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/taste-skill/SKILL.md), Collected skill reference.
43. [industrial-brutalist-ui](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/brutalist-skill/SKILL.md), Collected skill reference.
44. [minimalist-ui](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/minimalist-skill/SKILL.md), Collected skill reference.
45. [high-end-visual-design](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/soft-skill/SKILL.md), Collected skill reference.
46. [better-layout, jakubkrehel](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-layout/SKILL.md), Collected skill reference.
47. [Match border radius on nested elements](https://www.ui-skills.com/playbook/use-concentric-border-radius), Collected playbook reference.
48. [better-ui, jakubkrehel](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-ui/SKILL.md), Collected skill reference.
49. [Align icons by eye for better balance](https://www.ui-skills.com/playbook/align-icons-optically), Collected playbook reference.
50. [Match icon stroke weight to text](https://www.ui-skills.com/playbook/match-icon-stroke-weight), Collected playbook reference.
51. [better-typography, jakubkrehel](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-typography/SKILL.md), Collected skill reference.
52. [typeset, pbakaus](https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/reference/typeset.md), Collected skill reference.
53. [Adjust letter spacing for large text](https://www.ui-skills.com/playbook/tune-tracking-by-size), Collected playbook reference.
54. [Use sentence case for UI labels](https://www.ui-skills.com/playbook/use-sentence-case-labels), Collected playbook reference.
55. [Improve contrast for muted text](https://www.ui-skills.com/playbook/keep-secondary-text-readable), Collected playbook reference.
56. [Keep body text lines easy to read](https://www.ui-skills.com/playbook/cap-line-length), Collected playbook reference.
57. [better-colors, jakubkrehel](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-colors/SKILL.md), Collected skill reference.
58. [colorize, pbakaus](https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/reference/colorize.md), Collected skill reference.
59. [Use neutral borders around images](https://www.ui-skills.com/playbook/outline-images-neutrally), Collected playbook reference.
60. [Align numbers with tabular-nums](https://www.ui-skills.com/playbook/use-tabular-nums-for-data), Collected playbook reference.
61. [SKILL](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/ecommerce-image-workflow/SKILL.md), Collected skill reference.
62. [imagegen-frontend-web](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/imagegen-frontend-web/SKILL.md), Collected skill reference.
63. [checklist](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/ecommerce-image-workflow/references/checklist.md), Collected design-reference reference.
64. [assets](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/assets.md), Collected design-reference reference.
65. [f6 product card grid](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/components/f6-product-card-grid.md), Collected design-reference reference.
66. [11 catalogue](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/macrostructures/11-catalogue.md), Collected design-reference reference.
67. [anti patterns](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/anti-patterns.md), Collected design-reference reference.
68. [Web Interface Guidelines README](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/e3d624baaf29dc1fc645aff3e38f03e564d2d6b1/README.md), Collected design-reference reference.
69. [accessibility, addyosmani](https://raw.githubusercontent.com/addyosmani/web-quality-skills/main/skills/accessibility/SKILL.md), Collected skill reference.
70. [better-accessibility, jakubkrehel](https://raw.githubusercontent.com/jakubkrehel/skills/main/skills/better-accessibility/SKILL.md), Collected skill reference.
71. [build-primitive, PrototyperAI](https://raw.githubusercontent.com/PrototyperAI/prototyper-ui/main/apps/docs/skill/build-primitive/SKILL.md), Collected skill reference.
72. [critique, pbakaus](https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/reference/critique.md), Collected skill reference.
73. [Preview the next item in scroll lists](https://www.ui-skills.com/playbook/peek-the-next-scroll-item), Collected playbook reference.
74. [Fade the edges of scrollable lists](https://www.ui-skills.com/playbook/fade-scroll-edges), Collected playbook reference.
75. [Truncate long titles in small spaces](https://www.ui-skills.com/playbook/clamp-overflowing-titles), Collected playbook reference.
76. [interface-design, Dammyjay93](https://raw.githubusercontent.com/Dammyjay93/interface-design/main/.claude/skills/interface-design/SKILL.md), Collected skill reference.
77. [Show nearby tooltips faster](https://www.ui-skills.com/playbook/warm-toolbar-tooltips), Collected playbook reference.
78. [Use solid modal backdrops instead of blur](https://www.ui-skills.com/playbook/use-solid-modal-scrims), Collected playbook reference.
79. [Add visible keyboard focus rings](https://www.ui-skills.com/playbook/show-visible-focus-rings), Collected playbook reference.
80. [Add visible labels to every form field](https://www.ui-skills.com/playbook/label-every-form-field), Collected playbook reference.
81. [Show form errors next to each field](https://www.ui-skills.com/playbook/show-errors-beside-fields), Collected playbook reference.
82. [Confirm destructive actions before they run](https://www.ui-skills.com/playbook/confirm-destructive-actions), Collected playbook reference.
83. [animate, emilkowalski](https://raw.githubusercontent.com/emilkowalski/skills/main/skills/animate/SKILL.md), Collected skill reference.
84. [STANDARDS](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/review-animations/STANDARDS.md), Collected documentation reference.
85. [12-principles-of-animation, raphaelsalaja](https://raw.githubusercontent.com/raphaelsalaja/skill/main/skills/12-principles-of-animation/SKILL.md), Collected skill reference.
86. [make-interfaces-feel-better, jakubkrehel](https://raw.githubusercontent.com/jakubkrehel/make-interfaces-feel-better/main/skills/make-interfaces-feel-better/SKILL.md), Collected skill reference.
87. [improve-animations, emilkowalski](https://raw.githubusercontent.com/emilkowalski/skills/main/skills/improve-animations/SKILL.md), Collected skill reference.
88. [to-spring-or-not-to-spring, raphaelsalaja](https://raw.githubusercontent.com/raphaelsalaja/skill/main/skills/to-spring-or-not-to-spring/SKILL.md), Collected skill reference.
89. [interaction-design, wshobson](https://raw.githubusercontent.com/wshobson/agents/main/plugins/ui-design/skills/interaction-design/SKILL.md), Collected skill reference.
90. [SKILL](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/emilkowalski-motion/SKILL.md), Collected skill reference.
91. [SKILL](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/skills/gsap-performance/SKILL.md), Collected skill reference.
92. [fixing-motion-performance, ibelick](https://raw.githubusercontent.com/ibelick/ui-skills/main/skills/fixing-motion-performance/SKILL.md), Collected skill reference.
93. [svg-animation, iart-ai](https://raw.githubusercontent.com/iart-ai/web-animation-skills/main/skills/svg-animation/SKILL.md), Collected skill reference.
94. [60fps-animation, iart-ai](https://raw.githubusercontent.com/iart-ai/web-animation-skills/main/skills/60fps-animation/SKILL.md), Collected skill reference.
95. [optimize, pbakaus](https://raw.githubusercontent.com/pbakaus/impeccable/main/skill/reference/optimize.md), Collected skill reference.
96. [performance, addyosmani](https://raw.githubusercontent.com/addyosmani/web-quality-skills/main/skills/performance/SKILL.md), Collected skill reference.
97. [components.manifest](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-systems/editorial/components.manifest.json), Collected design-reference reference.
98. [Web Interface Guidelines for Agents](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/e3d624baaf29dc1fc645aff3e38f03e564d2d6b1/AGENTS.md), Collected design-reference reference.
99. [study](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/study.md), Collected design-reference reference.
100. [image-to-code](https://raw.githubusercontent.com/Leonxlnx/taste-skill/ccbc15639c97057cbfcf32ecebc38ef716e4bb37/skills/image-to-code-skill/SKILL.md), Collected skill reference.
101. [README](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/README.md), Collected index reference.
102. [SKILL](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/SKILL.md), Collected skill reference.
103. [DESIGN](https://raw.githubusercontent.com/VoltAgent/awesome-design-md/8147538b4226ae41e2487a9179e3bcc1f68e8554/design-md/airbnb/DESIGN.md), Collected design-reference reference.
104. [DESIGN](https://raw.githubusercontent.com/VoltAgent/awesome-design-md/8147538b4226ae41e2487a9179e3bcc1f68e8554/design-md/shopify/DESIGN.md), Collected design-reference reference.
105. [visual styles](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-templates/hyperframes/visual-styles.md), Collected documentation reference.
106. [DESIGN](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-systems/editorial/DESIGN.md), Collected design-reference reference.
107. [DESIGN](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-systems/warm-editorial/DESIGN.md), Collected design-reference reference.
108. [editorial](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/genres/editorial.md), Collected design-reference reference.
109. [modern minimal](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/genres/modern-minimal.md), Collected design-reference reference.
110. [DESIGN](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-systems/mission-control/DESIGN.md), Collected design-reference reference.
111. [SKILL](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-templates/web-prototype-taste-soft/SKILL.md), Collected skill reference.
112. [playful](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/genres/playful.md), Collected design-reference reference.
113. [SKILL](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-templates/web-prototype-taste-brutalist/SKILL.md), Collected skill reference.
114. [DESIGN](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-systems/brutalism/DESIGN.md), Collected design-reference reference.
115. [atmospheric](https://raw.githubusercontent.com/nutlope/hallmark/13ac0ec7e148655948100b6396439e481361d690/skills/hallmark/references/genres/atmospheric.md), Collected design-reference reference.
116. [DESIGN](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-systems/glassmorphism/DESIGN.md), Collected design-reference reference.
117. [DESIGN](https://raw.githubusercontent.com/VoltAgent/awesome-design-md/8147538b4226ae41e2487a9179e3bcc1f68e8554/design-md/notion/DESIGN.md), Collected design-reference reference.
118. [SKILL](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-templates/web-prototype/SKILL.md), Collected skill reference.
119. [SKILL](https://raw.githubusercontent.com/nexu-io/open-design/c5ae6292c464094de80d0191fab50144bff8a027/design-templates/web-prototype-taste-editorial/SKILL.md), Collected skill reference.
120. [21st UI Skill](https://raw.githubusercontent.com/21st-dev/magic-mcp/6e5a43d3621442a450948864a74396d206b23c65/skills/21st-ui/SKILL.md), Collected skill reference.
121. [Magic MCP / 21st MCP README](https://raw.githubusercontent.com/21st-dev/magic-mcp/6e5a43d3621442a450948864a74396d206b23c65/README.md), Collected documentation reference.
122. [Browser Session Management](https://raw.githubusercontent.com/microsoft/playwright-cli/655530f6d0dc71a0d6bf46ae165877d3c7311099/skills/playwright-cli/references/session-management.md), Collected documentation reference.
123. [Storage State](https://raw.githubusercontent.com/microsoft/playwright-cli/655530f6d0dc71a0d6bf46ae165877d3c7311099/skills/playwright-cli/references/storage-state.md), Collected documentation reference.
124. [Test Generation](https://raw.githubusercontent.com/microsoft/playwright-cli/655530f6d0dc71a0d6bf46ae165877d3c7311099/skills/playwright-cli/references/test-generation.md), Collected documentation reference.
125. [Playwright CLI Skill](https://raw.githubusercontent.com/microsoft/playwright-cli/655530f6d0dc71a0d6bf46ae165877d3c7311099/skills/playwright-cli/SKILL.md), Collected skill reference.
126. [Tracing](https://raw.githubusercontent.com/microsoft/playwright-cli/655530f6d0dc71a0d6bf46ae165877d3c7311099/skills/playwright-cli/references/tracing.md), Collected documentation reference.
127. [Mobile Gestures: 40% of Sites Don't Support Pinch or Tap Gestures for Product Images](https://baymard.com/blog/mobile-image-gestures), Publication date unavailable; Saved search excerpt.
