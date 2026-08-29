# pkweb

[![Pages](https://github.com/ImperialBower/pkweb/actions/workflows/pages.yml/badge.svg)](https://github.com/ImperialBower/pkweb/actions/workflows/pages.yml)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
[![License: MIT OR Apache-2.0](https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-blue.svg)](#license)

A library of poker hand-analysis and GTO components — a hand replayer, range
grids, equity and strategy-mix panels — in four themes.

Pure client-side: vanilla ES modules and plain CSS, **no build step and no
dependencies**. Nothing to compile, nothing to install.

```
cd www && python3 -m http.server 8777    # then http://127.0.0.1:8777
```

## Components

| # | Component | # | Component |
|---|---|---|---|
| 01 | Hand replayer | 06 | Hand range grid |
| 02 | Board + hole cards | 07 | GTO strategy mix |
| 03 | Equity vs BB range | 08 | Range vs range |
| 04 | Stack & pot | 09 | Combo breakdown |
| 05 | Action timeline | | |

All nine share one store, so the seat and street controls in the replayer
drive every panel at once. Full API and conventions: [`www/README.md`](www/README.md).

[`www/examples/`](www/examples/) takes them one at a time: a page per
component with a live demo, the complete HTML to use it standalone, and the
store keys it reads.

## Themes

`theme-midnight` (default), `theme-terminal`, `theme-luxe`, `theme-organic` —
each a `body` class defining the same 50 tokens, so a component that reads only
`var(--*)` themes for free. Card pip colors sit deliberately outside the
themes: `--pip-red` / `--pip-black` are fixed, and `body.four-color` remaps
diamonds to blue and clubs to green.

Tokens originate in [pkarena0-web](https://github.com/ImperialBower/pkarena0-web)
`www/css/tokens.css`; this repo follows the same conventions so the two stay
legible to each other.

## Layout

```
www/
  index.html              the gallery — all nine components
  examples/               one page per component, with copy-paste usage
  css/                    tokens, shell, cards, components
  js/                     store, dom, themes, cards, ranges, hand
    components/           one module per component
```

Pushes to `main` publish `www/` to GitHub Pages.

## License

Licensed under either of

* Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE) or
  <http://www.apache.org/licenses/LICENSE-2.0>)
* MIT license ([LICENSE-MIT](LICENSE-MIT) or
  <http://opensource.org/licenses/MIT>)

at your option.

### Contribution

Unless you explicitly state otherwise, any contribution intentionally
submitted for inclusion in the work by you, as defined in the Apache-2.0
license, shall be dual licensed as above, without any additional terms or
conditions.
