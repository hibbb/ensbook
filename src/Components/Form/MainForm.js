import React from 'react';
import { utils } from 'ethers';
import { toast } from 'react-toastify'
import namehash from '@ensdomains/eth-ens-namehash'
import { t } from 'i18next';
import { isAddress } from 'ethers/lib/utils';
import { getNamesOfOwner } from '../Global/globals';

class MainForm extends React.Component {
  initialState = {
    labels: ''
  }
  state = this.initialState

  handleLabels = (labels) => {
    labels = labels.replace(/[,.'"?!@#$%^&*()/\\\\]/g, ' ').trim()
    if (labels.length < 1) { return false }
    // create an Array(originLabelsSet) including the original labels
    const newLabelsSet = new Set(labels.split(/\s+/));
    // only retain the labels whose length >= 3
    let newLabelsArr = [...newLabelsSet].filter(label => label.length >= 3)

    newLabelsArr.map((label, index) => {
      try { newLabelsArr[index] = namehash.normalize(label) } 
      catch(err) { delete newLabelsArr[index] }
      return null
    })
    // caculate the differences between the new and original labels, to avoid duplicates 
    return newLabelsArr 
  }

  addNames = async (labels) => {
    const { nameInfo, setAndStoreNameInfo, updateNames, network } = this.props
    let newLabelsArr = this.handleLabels(labels)
    
    const addressPosition = newLabelsArr.findIndex(item => isAddress(item))

    // if typed in a address, ENSBook will add the names that belong to the address
    if (addressPosition > -1) {
      newLabelsArr = await getNamesOfOwner(newLabelsArr[addressPosition], network)
    }

    // create an Array(originLabelsSet) including the original labels
    const originLabelsSet = new Set()
    nameInfo.map(row => originLabelsSet.add(row.label))

    const diffLabelsArr = [...new Set(newLabelsArr.filter(x => !originLabelsSet.has(x)))]
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
    await updateNames(diffLabelsArr)
    
    toast.info(t('msg.setAndStoreNameInfo'))
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
    const { labels } = this.state
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
