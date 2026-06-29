import { ɵresolveComponentResources as resolveComponentResources } from '@angular/core';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function collectFiles(dir: string, exts: string[]): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectFiles(full, exts));
    } else if (exts.some((e) => entry.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

const srcDir = join(process.cwd(), 'src');
const resourceFiles = collectFiles(srcDir, ['.html', '.scss']);

// Map './foo.component.html' → file content (all component filenames are unique)
const resourceMap = new Map<string, string>();
for (const file of resourceFiles) {
  resourceMap.set('./' + file.split('/').pop()!, readFileSync(file, 'utf-8'));
}

/**
 * Call in beforeEach() before configureTestingModule() to resolve component
 * templateUrl/styleUrl resources for JIT compilation in vitest.
 */
export const resolveResources = (): Promise<void> =>
  resolveComponentResources((url) =>
    Promise.resolve(new Response(resourceMap.get(url) ?? ''))
  );
