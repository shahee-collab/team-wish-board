"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="text-lg font-semibold text-red-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-red-700 mb-4">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="rounded-lg bg-primary text-white font-medium py-2 px-4 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
