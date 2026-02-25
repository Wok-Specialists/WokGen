import { fileURLToPath } from 'url';
import path from 'path';
import type { StorybookConfig } from '@storybook/nextjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async (webpackConfig) => {
    const rootNodeModules = path.resolve(__dirname, '../../../node_modules');
    const appNodeModules = path.resolve(__dirname, '../node_modules');
    const appDir = path.resolve(__dirname, '..');
    // Fix resolveLoader so storybook loaders (in root node_modules) are found.
    webpackConfig.resolve = webpackConfig.resolve ?? {};
    webpackConfig.resolve.modules = [
      ...(webpackConfig.resolve.modules ?? []),
      appNodeModules,
      rootNodeModules,
    ];
    webpackConfig.resolveLoader = webpackConfig.resolveLoader ?? {};
    webpackConfig.resolveLoader.modules = [
      appNodeModules,
      rootNodeModules,
    ];
    // Fix postcss-loader: point it at apps/web so it finds tailwindcss.
    const patchPostcssLoader = (rules: any[]): void => {
      for (const rule of rules) {
        if (!rule) continue;
        if (rule.use) patchPostcssLoader(Array.isArray(rule.use) ? rule.use : [rule.use]);
        if (rule.oneOf) patchPostcssLoader(rule.oneOf);
        if (rule.rules) patchPostcssLoader(rule.rules);
        if (typeof rule.loader === 'string' && rule.loader.includes('postcss-loader')) {
          rule.options = rule.options ?? {};
          rule.options.postcssOptions = {
            ...(rule.options.postcssOptions ?? {}),
            config: path.join(appDir, 'postcss.config.js'),
          };
        }
      }
    };
    patchPostcssLoader(webpackConfig.module?.rules ?? []);
    return webpackConfig;
  },
};

export default config;
