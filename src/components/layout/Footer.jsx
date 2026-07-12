export default function Footer() {
  return (
    <footer className="h-10 border-t border-border bg-surface flex items-center justify-between px-6">
      <p className="text-xs text-text-muted">
        © {new Date().getFullYear()} AssetFlow — Enterprise Asset Management
      </p>
      <p className="text-xs text-text-muted">v1.0.0</p>
    </footer>
  );
}
