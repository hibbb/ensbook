import React from 'react';
import { TableHead } from './TableHead'
import { TableBody } from './TableBody'

class MainTable extends React.Component {

  componentDidMount() {
    this.props.reconnectApp()
  }
  
  // Hide unregistrable names or not
  state = { "hideNames": false }

  render() {
    const { 
      conf, 
      nameInfo,
      type,  
      network, 
      setAndStoreNameInfo, 
      updateName, 
      updateNames, 
      estimateCost, 
      estimateCosts, 
      registerName, 
      registerNameEnd,
      registerNames, 
      registerNamesEnd,
      removeNames, 
      removeName, 
      regMsges, 
      regsMsges
    } = this.props

    const switchHideFlag = () => {
      this.setState({ "hideNames": !this.state.hideNames})
      setAndStoreNameInfo(nameInfo, false)
    }
  
    return (
      <div className="row table-wrapper">
        <table className="table table-hover ebr-tb">
          <TableHead
            type={type}
            nameInfo={nameInfo}
            setAndStoreNameInfo={setAndStoreNameInfo}
            updateNames={updateNames}
            registerNames={registerNames}
            registerNamesEnd={registerNamesEnd}
            defaultDuration={conf.custom.register.duration}
            hideNames={this.state.hideNames}
            switchHideFlag={switchHideFlag}
            removeNames={removeNames}
            estimateCosts={estimateCosts}
            regMsges={regMsges}
            regsMsges={regsMsges}
          />
          <TableBody 
            type={type}
            network={network}
            nameInfo={nameInfo} 
            setAndStoreNameInfo={setAndStoreNameInfo}
            conf={conf}
            updateName={updateName}
            registerName={registerName} 
            registerNameEnd={registerNameEnd}
            hideNames={this.state.hideNames}
            removeName={removeName} 
            estimateCost={estimateCost} 
            regMsges={regMsges}
          />
        </table>
      </div>
    )
  }
}

export default MainTable