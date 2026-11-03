/** Resolve application GLSL snippets before Three resolves its own ShaderChunks. */
export function composeShader(source: string, snippets: Record<string, string>): string {
  return source.replace(/#pragma app_include ([A-Za-z0-9_]+)/g, (_directive, name: string) => {
    const snippet = snippets[name];
    if (snippet === undefined) throw new Error(`Missing GLSL snippet: ${name}`);
    return snippet;
  });
}
