import { defineConfig, Plugin } from 'vitest/config';
import { resolve, dirname } from 'path';
import { readFileSync } from 'node:fs';

/**
 * Vite plugin that inlines Angular templateUrl/styleUrl at transform time,
 * so JIT compilation works in vitest without needing resolveComponentResources.
 */
function angularInlineTemplates(): Plugin {
  return {
    name: 'angular-inline-templates',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.ts') || id.endsWith('.spec.ts') || !id.includes('/src/')) {
        return null;
      }
      if (!code.includes('templateUrl') && !code.includes('styleUrl')) {
        return null;
      }

      // Replace templateUrl: './foo.html' with template: '<content>'
      code = code.replace(/templateUrl:\s*['"](.[^'"]+)['"]/g, (_, url) => {
        try {
          const content = readFileSync(resolve(dirname(id), url), 'utf-8');
          return `template: ${JSON.stringify(content)}`;
        } catch {
          return `template: ''`;
        }
      });

      // Remove styleUrl / styleUrls
      code = code.replace(/styleUrls?:\s*['"](.[^'"]+)['"],?/g, '');
      code = code.replace(/styleUrls:\s*\[[^\]]*\],?/g, '');

      return { code, map: null };
    },
  };
}

export default defineConfig({
  plugins: [angularInlineTemplates()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
  resolve: {
    alias: {
      '@enums': resolve(__dirname, './src/app/core/enums'),
      '@services': resolve(__dirname, './src/app/core/services'),
      '@models': resolve(__dirname, './src/app/core/models'),
      '@constants': resolve(__dirname, './src/app/core/constants'),
      '@interceptors': resolve(__dirname, './src/app/core/interceptors'),
      '@features': resolve(__dirname, './src/app/features'),
      '@components': resolve(__dirname, './src/app/features/dashboard/components'),
      '@env': resolve(__dirname, './src/environments/environment'),
      '@test-utils': resolve(__dirname, './src/test-utils'),
    },
  },
});
