export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-12">
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>Built with native Python tools for reliable PDF processing</p>
          <div className="flex items-center space-x-4">
            <span>Privacy-focused • No data stored</span>
            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
            <span>Local processing</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
