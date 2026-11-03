<script lang="ts">
  import { onMount } from 'svelte';
  import { REVISION } from 'three';
  import './loader.css';
  import { mountExperience, containOutboundLinks, type Snapshot, type StudyRuntime } from '../experience/runtime';

  let container: HTMLDivElement;
  let runtime = $state<StudyRuntime>();
  let status = $state('loading');
  let error = $state('');
  let snapshot = $state<Snapshot>();
  let paused = $state(false);
  let outbound = $state('');
  const learning = new URLSearchParams(location.search).has('learn');

  onMount(() => {
    const restore = containOutboundLinks((url) => { outbound = url; });
    let timer: ReturnType<typeof setInterval> | undefined;
    void mountExperience(container).then((value) => {
      runtime = value;
      if (learning) snapshot = value.snapshot();
      status = 'ready';
      if (learning) timer = setInterval(() => { snapshot = value.snapshot(); }, 250);
    }).catch((cause: unknown) => {
      console.error('Experience startup failed', cause);
      error = cause instanceof Error ? cause.message : String(cause);
      status = 'error';
    });
    return () => { restore(); clearInterval(timer); runtime?.dispose(); };
  });

  function togglePause() {
    paused = !paused;
    runtime?.pause(paused);
  }
</script>

<main aria-label="DEMO offline experience" data-status={status}>
  <div id="experience"><div id="webgl" bind:this={container}></div></div>
</main>

{#if status === 'loading'}
  <div id="loader" aria-label="Loading local assets"><div class="ascii"></div></div>
{/if}

{#if error}
  <div class="failure" role="alert"><h1>无法启动 3D 场景</h1><p>{error}</p><button onclick={() => location.reload()}>重试</button></div>
{/if}

{#if learning}
  <aside class="study-panel" aria-label="源码学习面板">
    <p class="eyebrow">DEMO / OFFLINE LAB</p>
    <h1>从真实渲染开始学习</h1>
    <p>Svelte 5 · Three.js r{REVISION} · TypeScript · GLSL</p>
    <div class="study-controls">
      <button disabled={!runtime} onclick={() => runtime?.jump(0)}>冰屋</button>
      <button disabled={!runtime} onclick={() => runtime?.jump(1)}>冰块</button>
      <button disabled={!runtime} onclick={() => runtime?.jump(2)}>体积粒子</button>
      <button disabled={!runtime} onclick={togglePause}>{paused ? '继续动画' : '暂停动画'}</button>
      <button disabled={!runtime} onclick={() => runtime?.mute()}>切换声音</button>
    </div>
    {#if snapshot}
      <dl>
        <dt>画布</dt><dd>{snapshot.width} × {snapshot.height}</dd>
        <dt>DPR</dt><dd>{snapshot.dpr.toFixed(2)}</dd>
        <dt>滚动进度</dt><dd>{snapshot.scroll.toFixed(3)}</dd>
        <dt>Draw calls</dt><dd>{snapshot.drawCalls}</dd>
        <dt>三角形</dt><dd>{snapshot.triangles.toLocaleString()}</dd>
        <dt>渲染帧</dt><dd>{snapshot.renderFrame}</dd>
      </dl>
    {/if}
    <nav aria-label="体验导航">
      <a href="/">返回体验 ↗</a>
    </nav>
    <p class="study-note">滚轮 / 上下方向键探索。面板只在 ?learn 时显示；暂停和跳转直接操作场景状态。</p>
  </aside>
{/if}

{#if outbound}
  <div class="outbound" role="dialog" aria-modal="true" aria-label="离线外链">
    <p class="eyebrow">OFFLINE DESTINATION</p>
    <h2>这是原站的外部链接</h2>
    <p>离线体验保留其目标地址。</p>
    <code>{outbound}</code>
    <button onclick={() => { outbound = ''; }}>返回场景</button>
  </div>
{/if}
