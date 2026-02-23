import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-6">
        <div className="text-6xl font-light text-muted-foreground/30">404</div>
        <div>
          <h2 className="text-xl font-semibold">Page Not Found</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This page doesn't exist yet.
          </p>
        </div>
        <Link
          to={createPageUrl("Today")}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Today
        </Link>
      </div>
    </div>
  );
}