import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <Card className="max-w-2xl w-full border-destructive/50 bg-card/60">
            <CardHeader>
              <CardTitle className="font-mono text-destructive flex items-center gap-2">
                <span className="text-2xl">⚠</span>
                SYSTEM ERROR DETECTED
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="terminal terminal-flicker p-4 bg-background/40 rounded">
                <div className="font-mono text-sm">
                  <p className="text-destructive mb-2">
                    &gt; CRITICAL ERROR: {this.props.fallbackMessage || 'An unexpected error occurred'}
                  </p>
                  {this.state.error && (
                    <p className="text-muted-foreground mb-2">
                      &gt; ERROR TYPE: {this.state.error.toString()}
                    </p>
                  )}
                  <p className="text-muted-foreground mt-4">
                    &gt; The terminal interface has encountered an error and needs to reset.
                  </p>
                </div>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs bg-destructive/10 p-3 rounded border border-destructive/30">
                  <summary className="font-mono cursor-pointer text-destructive hover:text-destructive/80">
                    Developer Details (DEV MODE ONLY)
                  </summary>
                  <pre className="mt-2 text-muted-foreground overflow-auto">
                    {this.state.error.stack}
                    {'\n\n'}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="default"
                  className="flex-1"
                >
                  Reload Terminal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
