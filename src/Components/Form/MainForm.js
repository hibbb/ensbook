import React from 'react';
import { utils } from 'ethers';
import namehash from '@ensdomains/eth-ens-namehash'

class MainForm extends React.Component {
  initialState = {
    labels: ''
  }
  state = this.initialState

  addNames = async (labels) => {
    const { nameInfo, setAndStoreNameInfo, updateName } = this.props

    labels = labels.replace(/[,.'"?!@#$%^&*()/\\\\]/g, ' ').trim()
    if (labels.length < 1) { return false }
    // create an Array(originLabelsSet) including the original labels
    const originLabelsSet = new Set()
    nameInfo.map(row => originLabelsSet.add(row.label))
    // split the string by spaces to labels and remove duplicates
    const newLabelsSet = new Set(labels.split(/\s+/));
    // only retain the labels whose length >= 3
    let newLabelsArr = [...newLabelsSet].filter(label => label.length >= 3)

    newLabelsArr.map((label, index) => {
      try { newLabelsArr[index] = namehash.normalize(label) } 
      catch(err) { delete newLabelsArr[index] }
      return null
    })
    // caculate the differences between the new and original labels, to avoid duplicates 
    let diffLabelsArr = [...new Set(newLabelsArr.filter(x => !originLabelsSet.has(x)))]; 
    const originNameInfoLen = nameInfo.length

    diffLabelsArr.map(label => 
      nameInfo.push({
        "label": label,
        "level": 0,
        "status": "Unknown",
        "tokenId": utils.id(label)
      })
    )
    setAndStoreNameInfo(nameInfo, false)

    // update the status of newly added names
    for(let i = originNameInfoLen; i < nameInfo.length; i++) {
      updateName(i)
    }
  }

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
    this.addNames(labels)
    this.setState(this.initialState)
  }

  // Click the text box 3 times to display all current name labels.
  inputClickCount = 0
  displayLabels = () => {
    this.inputClickCount += 1;
    setTimeout(() => {
      if (this.inputClickCount === 3) {
        const labels = this.props.nameInfo.map(item => item.label).join(' ')
        this.setState({"labels": labels})
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
            placeholder={t('form.holder')} 
            value={labels}
            onChange={this.handleChange} 
            onKeyDown={this.handleKeyDown}
            onClick={this.displayLabels}
          />
          <button type="button" 
          className="btn btn-primary" 
          onClick={this.submitForm}>
            {t('form.btn')}
          </button>
        </div>
      </form>
    )
  }
}

export default MainForm
