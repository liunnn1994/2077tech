# WebGL 场景演示源码

Svelte 5 / TypeScript 7 / Three.js r187 / GLSL / Vite。模型、纹理、字体、音频和 WASM 均从本地加载。

## 开发

```sh
pnpm install --frozen-lockfile
pnpm dev
```

环境见 `.mise.toml`。普通页面通过滚轮、方向键和触控浏览三个场景；点击冰块进入项目，Close 或 Escape 返回。`/?learn` 提供场景跳转、暂停和声音控制。

## 构建与测试

```sh
pnpm build
pnpm preview
pnpm verify
pnpm test:e2e --dev
```

`verify` 依次执行格式、lint、类型检查、构建及 Cypress 真实 Chrome E2E。测试覆盖本地资源加载、几何解码、冰块擦霜、两个项目的链接与历史导航、粒子切换、触控、声音、暂停、加载失败重试和 Worker 生命周期。正常场景同时检查主线程与 Worker 的控制台错误。

测试只在失败时保存截图到已忽略的 `cypress/screenshots/`，不生成额外诊断记录。首次安装依赖需要网络；页面运行不依赖网络资源。外部网站链接在本地弹层显示目标地址。

## 源码入口

- `src/app/App.svelte`：Svelte 页面与生命周期。
- `src/experience/runtime.ts`：体验入口、学习面板与测试使用的运行接口。
- `src/engine/bootstrap.ts`、`ExperienceController.ts`：启动、路由、滚动和场景合成。
- `src/scenes/`：冰屋、冰块、粒子和项目详情。
- `src/shaders/`：独立 GLSL；通过 Vite `?raw` 导入。
- `src/engine/loaders/`、`workers/`：几何、纹理、字体与线程加载。
- `src/ui/webgl/`：MSDF 文字、命中区域和画布 UI。
- `public/assets/`：模型、纹理、字体、音频及解码器。
- `cypress/`：E2E 用例、真实浏览器检查及测试启动器。

核心采用严格 TypeScript，部分场景算法使用 JavaScript（`checkJs: false`）。`scripts/sync-decoders.mjs` 从已安装的 Three.js 同步完整 Draco 和 Basis 解码器；完整 Draco 同时支持网格和点云。

项目使用 TypeScript 7 编译器。当前 svelte-check 仍依赖 TypeScript 6 的 JavaScript API，`.pnpmfile.cjs` 将兼容 API 限定在检查器内部，实际诊断通过 `--tsgo` 使用 TypeScript 7。

画面与美术来源：Igloo Inc. / abeto。第三方库许可证随各自 npm 包提供。
