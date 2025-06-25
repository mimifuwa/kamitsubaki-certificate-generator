export default function Footer() {
  return (
    <footer className="py-6 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">© {new Date().getFullYear()} mimifuwa</p>
          <p className="text-xs text-gray-500">
            このサイトはKAMITSUBAKI STUDIOとは一切関係ありません
          </p>
        </div>
      </div>
    </footer>
  );
}
