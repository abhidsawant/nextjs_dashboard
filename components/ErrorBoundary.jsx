"use client";
import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-20 left-20 w-80 h-80 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #dc2626, transparent)" }} />
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #d97706, transparent)" }} />
        <div className="p-8 rounded-3xl w-full max-w-md text-center relative z-10" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gradient mb-2">Oops! Something broke</h2>
          <p className="text-slate-400 text-sm mb-6">{this.state.error?.message || "An unexpected error occurred"}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })} className="btn-primary">
            Try Again 🔄
          </button>
        </div>
      </div>
    );
    return this.props.children;
  }
}
