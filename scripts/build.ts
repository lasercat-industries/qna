await Bun.build({
  entrypoints: ['./src/questions/index.ts'],
  outdir: 'dist',
});
