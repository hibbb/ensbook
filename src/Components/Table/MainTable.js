import React from 'react';
import { TableHead } from './TableHead'
import { TableBody } from './TableBody'

class MainTable extends React.Component {

  componentDidMount() {
    this.props.reconnectApp()
  }
  
  // Hide unregistrable names or not
  state = { 
    "hideNames": false,
    "regList": [],
    "renewList": []
  }

  addRegName = (label) => {
    const { regList } = this.state
    regList.push(label)
    this.setState({ regList })
  }

  removeRegName = (label) => {
    const regList = this.state.regList.filter(item => item !== label)
    this.setState({ regList })
  }

  clearRegList = () => {
    this.setState({ regList: [] })
    const regCheckboxes = document.getElementsByClassName("reg-checkbox")
    for (let i = 0; i < regCheckboxes.length; i ++) {
      regCheckboxes[i].checked = false
    }
  }

  addRenewName = (label) => {
    const { renewList } = this.state
    renewList.push(label)
    this.setState({ renewList })
  }

  removeRenewName = (label) => {
    const renewList = this.state.renewList.filter(item => item !== label)
    this.setState({ renewList })
  }

  clearRenewList = () => {
    this.setState({ renewList: [] })
    const renewCheckboxes = document.getElementsByClassName("renew-checkbox")
    for (let i = 0; i < renewCheckboxes.length; i ++) {
      renewCheckboxes[i].checked = false
    }
    console.log('RenewList Cleared.')
  }

  render() {
    const { 
      conf, 
      estimateCost, 
      estimateCosts, 
      getDefaultNameReceiver, 
      nameInfo,
      type, 
      address,
      network, 
      reconnecting, 
      fetching, 
      registerName, 
      registerNameEnd,
      registerNames, 
      registerNamesEnd,
      removeNames, 
      removeName, 
      renewMsges,
      renewName,
      renewNameEnd,
      renewNames,
      renewNamesEnd,
      regMsges, 
      regsMsges,
      renewsMsges,
      setAndStoreNameInfo, 
      updateNames
    } = this.props

    const { 
      hideNames, 
      regList, 
      renewList, 
    } = this.state

    const switchHideFlag = () => {
      this.setState({ "hideNames": !hideNames })
      setAndStoreNameInfo(nameInfo, false)
    }
    
    return (
      <div className="row table-wrapper">
        <table className="table table-hover ebr-tb">
          <TableHead
            type={type}
            reconnecting={reconnecting}
            fetching={fetching}
            nameInfo={nameInfo}
            setAndStoreNameInfo={setAndStoreNameInfo}
            conf={conf}
            updateNames={updateNames}
            registerNames={registerNames}
            registerNamesEnd={registerNamesEnd}
            regList={regList}
            clearRegList={this.clearRegList}
            renewNames={renewNames}
            renewNamesEnd={renewNamesEnd}
            renewList={renewList}
            clearRenewList={this.clearRenewList}
            hideNames={this.state.hideNames}
            switchHideFlag={switchHideFlag}
            removeNames={removeNames}
            estimateCosts={estimateCosts}
            regMsges={regMsges}
            regsMsges={regsMsges}
            renewsMsges={renewsMsges}
            getDefaultNameReceiver={getDefaultNameReceiver}
          />
          <TableBody 
            reconnecting={reconnecting}
            type={type}
            address={address}
            network={network}
            nameInfo={nameInfo} 
            setAndStoreNameInfo={setAndStoreNameInfo}
            conf={conf}
            updateNames={updateNames}
            registerName={registerName} 
            registerNameEnd={registerNameEnd}
            addRegName={this.addRegName}
            removeRegName={this.removeRegName}
            addRenewName={this.addRenewName}
            removeRenewName={this.removeRenewName}
            renewName={renewName}
            renewNameEnd={renewNameEnd}
            hideNames={this.state.hideNames}
            removeName={removeName} 
            estimateCost={estimateCost} 
            regMsges={regMsges}
            renewMsges={renewMsges}
            getDefaultNameReceiver={getDefaultNameReceiver}
          />
        </table>
      </div>
    )
  }
}

export default MainTable