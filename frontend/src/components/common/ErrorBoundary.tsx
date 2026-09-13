import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-stone-200 flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-[36px]">
                warning
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
                Something went wrong
              </h2>
              <p className="text-sm text-stone-500 leading-relaxed">
                An unexpected interface issue occurred. You can reload this page or return to the main dashboard.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-left text-xs font-mono text-stone-600 truncate">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center gap-3 w-full pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-sm font-semibold border border-stone-200 transition-all cursor-pointer"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
