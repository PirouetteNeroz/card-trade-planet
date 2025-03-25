
export function CartFooter() {
  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} Card Planet. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
