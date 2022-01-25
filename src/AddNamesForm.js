import React from 'react';

class AddNamesForm extends React.Component {
  initialState = {
    labels: ''
  }
  state = this.initialState

  handleChange = (event) => {
    const {value} = event.target
    this.setState({"labels": value})
  }
  
  handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      this.submitForm()
      event.preventDefault()
      return false
    }
  }

  submitForm = () => {
    const labels = this.state.labels
    this.props.addNames(labels)
    this.setState(this.initialState)
  }

  // Click the text box 3 times to display all current name labels.
  inputClickCount = 0
  displayLabels = () => {
    this.inputClickCount += 1;
    setTimeout(() => {
      if (this.inputClickCount === 3) {
        this.setState({"labels": this.props.getLabels()})
      }
      this.inputClickCount = 0;
    }, 500); 
  }
  

  render() {
    const {labels} = this.state
    const {t} = this.props
    return (
      <form id="add-names-form" className="row g-3 mb-3 sticky-top add-names-form">
        <div className="input-group mb-3">
          <input type="text" 
            className="form-control" 
            autoComplete="off"
            name="labels"
            id="labels"
            autoFocus
            placeholder={t('tb.holder')} 
            value={labels}
            onChange={this.handleChange} 
            onKeyDown={this.handleKeyDown}
            onClick={this.displayLabels}
          />
          <button type="button" 
          className="btn btn-primary" 
          onClick={this.submitForm}>
            {t('tb.btn.add')}
          </button>
        </div>
      </form>
    )
  }
}

export default AddNamesForm
