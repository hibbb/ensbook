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
      updateNameByLabel,
      updateBalance, 
      estimateCost, 
      estimateCosts, 
      registerName, 
      registerNames, 
      removeNames, 
      removeName, 
      messages, 
      t
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
            hideNames={this.state.hideNames}
            switchHideFlag={switchHideFlag}
            removeNames={removeNames}
            estimateCosts={estimateCosts}
            t={t}
          />
          <TableBody 
            type={type}
            network={network}
            nameInfo={nameInfo} 
            setAndStoreNameInfo={setAndStoreNameInfo}
            conf={conf}
            updateName={updateName}
            updateNameByLabel={updateNameByLabel}
            updateBalance={updateBalance}
            registerName={registerName} 
            hideNames={this.state.hideNames}
            removeName={removeName} 
            estimateCost={estimateCost} 
            messages={messages}
            t={t}
          />
        </table>
      </div>
    )
  }
}

export default MainTable