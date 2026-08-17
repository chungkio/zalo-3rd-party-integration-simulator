import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 shadow-2xl text-center glass-panel">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-100 mb-2">Đã xảy ra lỗi hiển thị (React Runtime Error)</h2>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {this.state.error?.toString() || 'Có lỗi không xác định xảy ra trong quá trình render.'}
            </p>

            {this.state.errorInfo && (
              <pre className="bg-slate-950 text-red-300 p-3 rounded-lg text-[10px] font-mono overflow-x-auto text-left max-h-40 border border-slate-800 mb-4">
                {this.state.errorInfo.componentStack}
              </pre>
            )}

            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" /> Tải lại trang (Reload)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
