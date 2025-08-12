import React from "react";

export default class ErrorBoundary extends React.Component {
  state = { err: null };

  static getDerivedStateFromError(err) {
    return { err };
  }

  componentDidCatch(err, info) {
    console.error("[ErrorBoundary]", err, info);
  }

  render() {
    if (this.state.err) {
      return (
        <div style={{ padding: 16, border: "1px solid #fecaca", background: "#fee2e2", borderRadius: 8 }}>
          <strong>Something went wrong.</strong>
          <div style={{ color: "#7f1d1d", marginTop: 8 }}>
            {String(this.state.err?.message || this.state.err)}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
