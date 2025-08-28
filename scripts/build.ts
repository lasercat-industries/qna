await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: 'dist',
  external: ['react-dom', 'react'], // default: []
});
