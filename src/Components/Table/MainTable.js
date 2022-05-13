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
  }

  render() {
    const { 
      conf, 
      estimateCost, 
      estimateCosts, 
      getDefaultNameReceiver, 
      nameInfo,
      network, 
      reconnecting, 
      registerName, 
      registerNameEnd,
      registerNames, 
      registerNamesEnd,
      regMsges, 
      regsMsges,
      removeNames, 
      removeName, 
      renewMsges,
      renewName,
      renewNameEnd,
      setAndStoreNameInfo, 
      type,  
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
            nameInfo={nameInfo}
            setAndStoreNameInfo={setAndStoreNameInfo}
            updateNames={updateNames}
            registerNames={registerNames}
            registerNamesEnd={registerNamesEnd}
            regList={regList}
            clearRegList={this.clearRegList}
            renewList={renewList}
            clearRenewList={this.clearRenewList}
            defaultDuration={conf.custom.register.duration}
            hideNames={this.state.hideNames}
            switchHideFlag={switchHideFlag}
            removeNames={removeNames}
            estimateCosts={estimateCosts}
            regMsges={regMsges}
            regsMsges={regsMsges}
            getDefaultNameReceiver={getDefaultNameReceiver}
          />
          <TableBody 
            type={type}
            reconnecting={reconnecting}
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