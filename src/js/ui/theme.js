const themes = new Set(['forest', 'wine', 'london', 'yellow']);

export function normalizeTheme(value) {
  return themes.has(value) ? value : 'forest';
}

export function applyTheme(value, root = document.documentElement) {
  const theme = normalizeTheme(value);
  root.dataset.theme = theme;
  return theme;
}
