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
      network, 
      setAndStoreNameInfo, 
      updateName, 
      updateNames, 
      estimateCost, 
      estimateCosts, 
      register, 
      registerAll, 
      removeNames, 
      removeName, 
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
            nameInfo={nameInfo}
            setAndStoreNameInfo={setAndStoreNameInfo}
            updateNames={updateNames}
            registerAll={registerAll}
            hideNames={this.state.hideNames}
            switchHideFlag={switchHideFlag}
            removeNames={removeNames}
            estimateCosts={estimateCosts}
            t={t}
          />
          <TableBody 
            nameInfo={nameInfo} 
            network={network}
            setAndStoreNameInfo={setAndStoreNameInfo}
            conf={conf}
            updateName={updateName}
            register={register} 
            hideNames={this.state.hideNames}
            removeName={removeName} 
            estimateCost={estimateCost} 
            t={t}
          />
        </table>
      </div>
    )
  }
}

export default MainTable