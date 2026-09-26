# 3D Preservation Plan

The current 3D twin is not being rewritten during the first migration phase.

The following files were copied verbatim from the legacy repository into the refactored repository:

- apps/web/src/features/twin/DigitalTwin3D.js
- apps/web/src/features/twin/texture_gen.js
- apps/web/src/features/map/CadastreMap2D.js

Only the texture import path in DigitalTwin3D.js was changed because the file now lives in a feature directory.

The renderer remains the reference implementation.

## Migration sequence

1. Keep renderer.
2. Normalize API data into the renderer contract.
3. Run visual/manual parity checks.
4. Add tests around geometry inputs.
5. Refactor internals only after parity is established.

The purpose is to change architecture without changing the visible 3D result.
