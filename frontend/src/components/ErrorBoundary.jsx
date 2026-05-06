import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, message: err?.message || 'An unexpected error occurred.' }
  }

  componentDidCatch(err, info) {
    console.error('[ErrorBoundary]', err, info)
  }

  reset = () => this.setState({ hasError: false, message: '' })

  render() {
    if (this.state.hasError) {
      return (
        <div className="err-boundary">
          <p className="err-boundary-title">⚠️ Something went wrong</p>
          <p className="err-boundary-msg">{this.state.message}</p>
          <button className="btn btn-danger" onClick={this.reset}>Try Again</button>
        </div>
      )
    }
    return this.props.children
  }
}
