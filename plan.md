# Relay website plan

## Product scope
Relay is a responsive single-page marketing website for a developer tool that helps teams understand codebases faster by connecting GitHub repositories and using AI for project context, onboarding, search, and handoff. The page follows the supplied Relay design-system board as a visual reference without reproducing every screen literally.

## Design direction

- **Design movement:** Editorial developer-tool minimalism with Swiss information design and a quiet architectural/industrial sensibility.
- **Core principles:** (1) make technical complexity feel legible, (2) balance warm paper space with high-contrast product surfaces, (3) use index-like navigation and rules to create rhythm, (4) make every interaction purposeful and tactile.
- **Color philosophy:** Warm linen and bone tones create a calm reading surface; charcoal is reserved for product surfaces and moments of focus; copper-orange is the ownable action color that signals movement and warmth; moss and signal yellow appear as small system-status cues.
- **Layout paradigm:** Asymmetric editorial composition rather than a centered marketing grid: split hero, indexed side notes, offset dashboard frames, and wide horizontal bands that read like a design-system board.
- **Signature elements:** Chain-link Relay mark, copper measurement lines/arrows, and blueprint-like code/architecture diagrams with numbered labels.
- **Interaction philosophy:** Interactions reveal context, not decoration. Feature tabs change the narrative panel, nav anchors glide to sections, and buttons use slight lift/press states.
- **Animation:** Fast, restrained transitions (180–450ms); cards fade/translate in on load, active feature content crossfades, diagram nodes pulse softly, and hover states move one or two pixels without bounce.
- **Typography system:** Serif display headlines (Georgia fallback) for editorial authority; compact grotesk/system sans for navigation and UI; monospaced labels for code, metadata, and section indices.
- **Brand essence:** The fastest path from an unfamiliar repository to useful understanding; for engineers and teams inheriting complex codebases; distinct because it turns repository evidence into a living project map. Personality: precise, calm, observant.
- **Brand voice:** Direct, evidence-led, quietly confident. Example lines: “Start with context, not guesswork.” and “Ask the repository what it already knows.”
- **Wordmark & logo:** A custom CSS/SVG chain-link mark paired with a spaced, uppercase RELAY wordmark; the mark reappears as a small connection glyph in diagrams and UI.
- **Signature brand color:** Copper `#c6603e`, used as an intentional signal for actions and connective paths.

## Implementation approach

- Use the initialized React/Vite frontend with a single `Home` route and no server/database dependency.
- Build reusable in-page sections in `client/src/pages/Home.tsx`, with small data arrays for features, workflow steps, and dashboard activity.
- Replace the starter global stylesheet with a bespoke responsive design system in `client/src/index.css`.
- Use inline SVG/CSS diagrams and product UI mockups so the landing page has a distinctive visual asset without relying on generic stock imagery.
- Add `public/manus-routes.json` for the `/` route and `app.config.ts` for project logo metadata before checkpointing.

## Project structure

- `client/src/pages/Home.tsx`: Relay landing page, navigation, feature interactions, diagram, dashboard preview, CTA.
- `client/src/index.css`: palette, typography, responsive layout, motion, component styling.
- `client/public/manus-routes.json`: declared page routes for Preview.
- `client/public/relay-mark.svg`: compact Relay logo asset.
- `app.config.ts`: quoted project logo URL metadata.
- `TODO.md`: scoped outcome criteria and delivery status.
