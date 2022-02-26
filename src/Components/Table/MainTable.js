import React from 'react';
import { TableHead } from './TableHead'
import { TableBody } from './TableBody'

class MainTable extends React.Component {

  componentDidMount() {
    this.props.updateNames()
  }
  
  // Hide unregistrable names or not
  state = { "hideNames": false }

  render() {
    const { 
      nameInfo, 
      conf, 
      setAndStoreNameInfo, 
      updateName, 
      updateNames, 
      estimatePrice, 
      estimatePriceAll, 
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
  
    const registrableStatuses = ['Open', 'Reopen', 'Premium']
    const isRegistrable = (status) => {
      return registrableStatuses.indexOf(status) >= 0
    }
    const renewableStatuses = ['Normal', 'Grace']
    const isRenewable = (status) => {
      return renewableStatuses.indexOf(status) >=0
    }
  
    return (
      <div className="row table-wrapper">
        <table className="table table-hover ebr-tb">
          <TableHead
            nameInfo={nameInfo}
            setAndStoreNameInfo={setAndStoreNameInfo}
            updateNames={updateNames}
            isRenewable={isRenewable}
            registerAll={registerAll}
            isRegistrable={isRegistrable}
            hideNames={this.state.hideNames}
            switchHideFlag={switchHideFlag}
            removeNames={removeNames}
            estimatePriceAll={estimatePriceAll}
            t={t}
          />
          <TableBody 
            nameInfo={nameInfo} 
            setAndStoreNameInfo={setAndStoreNameInfo}
            conf={conf}
            updateName={updateName}
            isRenewable={isRenewable}
            register={register} 
            hideNames={this.state.hideNames}
            isRegistrable={isRegistrable}
            removeName={removeName} 
            estimatePrice={estimatePrice} 
            t={t}
          />
        </table>
      </div>
    )
  }
}

export default MainTable