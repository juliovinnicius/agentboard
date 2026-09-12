// Each package is small enough that a full lint:fix is cheap and simpler
// than mapping staged file paths across two independent npm projects.
export default {
  'backend/**/*.ts': () => 'npm --prefix backend run lint:fix',
  'frontend/**/*.{ts,tsx}': () => 'npm --prefix frontend run lint:fix',
};
