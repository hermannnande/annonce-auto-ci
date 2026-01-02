import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

type Props = {
  children: React.ReactNode;
  title?: string;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log dev-friendly (ne pas bloquer l'app)
    console.error('[ErrorBoundary] Unhandled UI error:', error, info);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const title = this.props.title || "Une erreur s'est produite";
    const message = this.state.error?.message || 'Erreur inconnue';

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Card className="max-w-xl w-full p-6 border-0 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#0F172A]">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                La page a rencontré un problème. Cliquez sur “Recharger” ou copiez le message ci-dessous.
              </p>

              <div className="mt-4 rounded-lg bg-gray-50 border p-3">
                <p className="text-xs font-mono text-gray-700 break-words">{message}</p>
              </div>

              <div className="mt-4 flex gap-2">
                <Button onClick={this.handleReload} className="gap-2 bg-[#0F172A] hover:bg-[#1e293b]">
                  <RefreshCw className="w-4 h-4" />
                  Recharger
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }
}




