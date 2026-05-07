import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, message: err.message || 'Unknown error' }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h3>⚠ Something went wrong</h3>
          <p>{this.state.message}</p>
          <button
            className="btn btn-ghost"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
