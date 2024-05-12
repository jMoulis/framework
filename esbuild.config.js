const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

async function watchServer() {
  const config = {
    entryPoints: ['src/server.ts'],
    bundle: true,
    platform: 'node',
    target: ['node10.4'],
    outfile: 'dist/server.js',
    external: ['express'],
    plugins: [
      {
        name: 'rebuild-notify',
        setup(build) {
          build.onEnd((result) => {
            console.info(
              `build server ended with ${result.errors.length} errors`
            );
          });
        },
      },
    ],
  };
  esbuild.build(config);
  let ctx = await esbuild.context(config);
  await ctx.watch();
  console.log('Watching server...');
}
watchServer().then(() => {
  function generateComponentList() {
    const componentsDir = path.join(__dirname, 'src/', 'webcomponents');
    const files = fs.readdirSync(componentsDir);
    const componentsUrls = files.filter((file) =>
      file.endsWith('.webcomponent.ts')
    );
    const components = componentsUrls
      .map((componentUrl) => {
        return `import './webcomponents/${componentUrl}';`;
      })
      .join('\n');
    const loaderFunction = `/** DO NOT REMOVE THIS CONTENT */
      import './client/components/BaseComponent.ts';
    import './client/index.ts';
  ${components}
  /**************************/`;
    fs.writeFileSync(
      path.join(__dirname, 'src', '_entry.client.ts'),
      loaderFunction
    );
  }
  async function watchClient() {
    const config = {
      entryPoints: ['src/_entry.client.ts'],
      outfile: 'dist/client/index.js',
      bundle: true,
      platform: 'browser',
      target: 'es2019',
      plugins: [
        {
          name: 'rebuild-notify',
          setup(build) {
            build.onEnd((result) => {
              console.info(
                `build client ended with ${result.errors.length} errors`
              );
            });
            build.onStart(async () => {
              generateComponentList();
            });
          },
        },
      ],
    };
    esbuild.build(config);
    let ctx = await esbuild.context(config);
    await ctx.watch();
  }
  watchClient();
});
