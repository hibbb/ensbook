import React from 'react';
import { TableHead } from './Thead/TableHead'
import { TableBody } from './TBody/TableBody'

class NamesDisplayTable extends React.Component {

  componentDidMount() {
    this.props.updateNames(false)
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
      book, 
      cancelBook, 
      removeNames, 
      removeName, 
      t
    } = this.props

    const switchHideFlag = () => {
      this.setState({ "hideNames": !this.state.hideNames})
      setAndStoreNameInfo(nameInfo, false)
    }
  
    const registrableStatuses = ['Open', 'Reopen', 'Premium']
  
    return (
      <table className="table table-hover ebr-tb">
        <TableHead
          nameInfo={nameInfo}
          setAndStoreNameInfo={setAndStoreNameInfo}
          updateNames={updateNames}
          registerAll={registerAll}
          registrableStatuses={registrableStatuses}
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
          register={register} 
          hideNames={this.state.hideNames}
          registrableStatuses={registrableStatuses}
          removeName={removeName} 
          estimatePrice={estimatePrice} 
          book={book}
          cancelBook={cancelBook}
          t={t}
        />
      </table>
    )
  }
}

export default NamesDisplayTable