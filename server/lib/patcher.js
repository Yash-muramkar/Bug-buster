import * as Diff from 'diff';

/**
 * Creates a unified diff between old content and new content.
 */
export function createUnifiedDiff(fileName, oldContent, newContent) {
  return Diff.createTwoFilesPatch(
    `a/${fileName}`,
    `b/${fileName}`,
    oldContent,
    newContent,
    'unpatched',
    'patched',
    { context: 3 }
  );
}

/**
 * Applies a unified diff patch to target content.
 */
export function applyPatch(sourceContent, patchString) {
  const result = Diff.applyPatch(sourceContent, patchString);
  if (result === false) {
    throw new Error('Failed to cleanly apply patch to source file.');
  }
  return result;
}

/**
 * Parses a diff string into structured hunk lines for UI rendering.
 */
export function parseDiff(patchString) {
  const parsed = Diff.parsePatch(patchString);
  return parsed;
}
