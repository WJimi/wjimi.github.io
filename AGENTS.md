# Repository Guidelines

## Project Structure & Module Organization

Firefly is an Astro 7 site with Svelte islands and TypeScript configuration. Main source code lives in `src/`: routes in `src/pages`, layouts in `src/layouts`, reusable UI in `src/components`, styles in `src/styles`, content in `src/content`, helpers in `src/utils`, and Markdown/HTML plugins in `src/plugins`. Site configuration is split across `src/config` with matching type definitions in `src/types`; prefer imports from `@/config` when available. Static files served directly belong in `public`, source-managed images in `src/assets`, docs in `docs` and `Firefly-Docs`, and automation in `scripts`.

## Build, Test, and Development Commands

Use `pnpm`; the `preinstall` script enforces it.

- `pnpm dev` or `pnpm start`: run the local Astro dev server.
- `pnpm check`: run Astro diagnostics.
- `pnpm type-check`: run TypeScript with `--noEmit`.
- `pnpm format`: format `src` with Biome.
- `pnpm lint`: run Biome checks and safe fixes on `src`.
- `pnpm build`: generate icons, LQIPs, the Astro build, font subsets, and Pagefind search output in `dist`.
- `pnpm preview`: preview the production build locally.
- `pnpm new-post`: scaffold a new content post.

## Coding Style & Naming Conventions

Biome is the formatter and linter. It uses tabs for indentation and double quotes for JavaScript/TypeScript strings. Keep Astro and Svelte components in `PascalCase` (`PostCard.astro`, `Search.svelte`), config modules in `camelCase` ending with `Config.ts`, and utilities in descriptive kebab case such as `date-utils.ts`. Keep `src/types` aligned with `src/config`. Avoid unrelated formatting churn.

## Testing Guidelines

There is no dedicated unit-test framework configured. Before submitting changes, run `pnpm check`, `pnpm type-check`, and `pnpm build` for rendering, content, or generated asset work. For visual or interactive changes, verify with `pnpm dev` or `pnpm preview` and include screenshots in the PR. Name future tests near the feature they cover, using the local file name as the stem.

## Commit & Pull Request Guidelines

Use Conventional Commits, matching the current history: `feat: ...`, `fix: ...`, and `chore: ...`. Keep commits and PRs focused on one concern. PRs should include a concise summary, linked issues when relevant, validation commands run, and screenshots for UI changes. Discuss major features or design changes in an issue or discussion before implementation.

## Security & Configuration Tips

Do not commit secrets, tokens, or service keys in config files. Keep deployment-specific settings in the target platform environment, and review generated files such as `dist`, `src/constants/lqips.json`, and `src/constants/icons.ts` before committing them.


## 知识库（knowledge-base）约定

`src/content/posts/knowledge-base/` 是一套问题驱动的长期学习系统的知识库，指导思想见该目录的 `README.md`（纲要，只读，不要改）。在这个目录下工作时：

- 知识库只有这一个根；`src/content` 是 Obsidian 的 vault 根，不是知识库根。写笔记一律走脚本，不要自己按 slug 拼路径：
  `python3 ~/.codex/skills/learning-system/scripts/new_note.py --dir <子目录> --title "<标题>"`
  （Windows 侧把 `python3` 换成 `python`，把 `~/.codex` 换成 `C:\Users\wjimi\.codex`）
- 目录路由：`00_inbox/` 归属不清的素材、`01_questions/` 问题、`02_kownledge/`（拼写如此，不要改名）概念与机制、`03_projects/<类别>/` 项目、`04_explore/` 待探索、`review/` 复盘与题解。
- `03_projects/` 下的子目录是**方向**，不是"类别垃圾桶"：`web/` `crypto/` `misc/` 指 CTF 的三个方向（`misc` = Misc 方向：隐写、取证、编码与流量、压缩包等，**不是**"其他杂项"），`automation/` 是非 CTF 的自动化项目。放不进去的先落 `00_inbox/`，不要塞进 `misc/`。
- 每篇笔记都要有 `slug`（形如 `knowledge-base/<子目录>/<小写短名>`）；文件名含空格、大写或标点时脚本会强制要求 `--slug`，否则链接点开是 404。
- frontmatter 的字符串字段一律加引号；`published` 必须裸写 `YYYY-MM-DD`；内容不适合公开时加 `--draft`。
- 收尾跑 `python3 ~/.codex/skills/learning-system/scripts/check_links.py <改动过的笔记>`，退出码非 0 就先修链接。
- 笔记写"我为什么知道它"：结论、关键机制、踩过的坑、可复用的做法。不改写已有笔记的表述，只补充和修正，补充时更新 `updated:`。
- 不要为了凑数新建笔记；这次确实没有值得沉淀的内容就直说。
- 同一个仓库在 Windows 侧是 `C:\wbog\Firefly\...`，WSL 侧是 `/mnt/c/wbog/Firefly/...`，是同一批文件。
