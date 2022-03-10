import React from 'react';
import confFile from './conf.json'
import { ExclamationTriangleFill, BoxArrowUpRight } from 'react-bootstrap-icons';
// import { utils } from 'ethers'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    this.logErrorToMyService(error, errorInfo);
  }

  logErrorToMyService = (error, errorInfo) => {
    this.setState({errorMessage: 'Error Message: ' + error.message})
    console.log('ErrorInfo: ')
    console.log(errorInfo)
  }

  render() {
  
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="container">
          <div className="alert alert-warning mt-5 text-center error-boundary" role="alert">
            <ExclamationTriangleFill /> Something went wrong. 
            <br />
            {this.state.errorMessage}
            <hr />
            You can <a href="https://github.com/hibbb/ensbook/issues" className="alert-link" target="_blank" rel="noreferrer">create an issue for this problem<BoxArrowUpRight className="external-link-icon" /></a> or <a href="/" className="alert-link">go back to ENSBook</a>.
            <hr />
            If errors occur repeatedly, you can try <a className="alert-link" href="/" onClick={()=>{window.localStorage.setItem("confInfo", JSON.stringify(confFile))}}>resetting</a> the configuration.
          </div>
        </div>
      )
    }

    return this.props.children; 
  }
}

export default ErrorBoundary