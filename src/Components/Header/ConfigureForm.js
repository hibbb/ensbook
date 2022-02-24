import React from 'react';
import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { ethers, utils } from 'ethers';
import { Gear, InfoCircle, BoxArrowUpRight, CaretRightFill, ChevronDown, Gift, CheckCircle } from 'react-bootstrap-icons';

class ConfigureForm extends React.Component {
  conf = JSON.parse(window.localStorage.getItem("confInfo"))
  provider = new ethers.providers.InfuraProvider(this.conf.custom.network, this.conf.custom.infuraID)

  logOperators = async () => {
    let keys = this.state.operatorPrivateKey.replace(/\s/g, "").split(",")
    console.log('Operators:')
    for (let i = 0; i < keys.length; i ++) {
      const op = (new ethers.Wallet(keys[i])).address
      console.log('%s...%s : %s', op.slice(0, 7), op.slice(-5), utils.formatEther(await this.provider.getBalance(op)).slice(0,7))
    }
  }

  state = {
    operatorPrivateKey: this.conf.custom.operatorPrivateKey.join(),
    network: this.conf.custom.network,
    receiverAddress: this.conf.custom.receiverAddress,
    infuraID: this.conf.custom.infuraID,
    pageTag: this.conf.custom.pageTag,
    pageTagColor: this.conf.custom.pageTagColor,
    displayTime: this.conf.custom.display.time,
    displayLookup: this.conf.custom.display.lookup,
    commitGasPrice: this.conf.custom.commitTxConf.gasPrice,
    commitGasLimit: this.conf.custom.commitTxConf.gasLimit,
    commitWaitConfirms: this.conf.custom.commitTxConf.waitConfirms,
    regDuration: this.conf.custom.regTxConf.duration,
    regValue: this.conf.custom.regTxConf.value,
    regGasPrice: this.conf.custom.regTxConf.gasPrice,
    regGasLimit: this.conf.custom.regTxConf.gasLimit,
    regWaitConfirms: this.conf.custom.regTxConf.waitConfirms,
    regRegisterWithConfig: this.conf.custom.regTxConf.registerWithConfig,
    bookTimeSlot: this.conf.custom.book.timeSlot,
    donatePercentage: this.conf.custom.donatePercentage
  }

  handleChange = (event) => {
    const {name, value} = event.target
    this.setState({[name]: value})
  }

  handleSelectBooleanChange = (event) => {
    const {name, value} = event.target
    this.setState({[name]: value === "false" ? false : true})
  }

  handleDisplayLookupChange = (event) => {
    const {name, checked} = event.target
    const {displayLookup} = this.state
    displayLookup[name] = checked
    this.setState({displayLookup: displayLookup})
  }

  submitForm = () => {
    const confInfo = JSON.parse(window.localStorage.getItem("confInfo"))
    confInfo.custom.operatorPrivateKey = this.state.operatorPrivateKey.replace(/\s/g, "").split(",")
    confInfo.custom.network  = this.state.network
    confInfo.custom.receiverAddress = this.state.receiverAddress.trim()
    confInfo.custom.infuraID = this.state.infuraID.trim()
    confInfo.custom.pageTag =  this.state.pageTag.trim()
    confInfo.custom.pageTagColor =  this.state.pageTagColor
    confInfo.custom.display.time = this.state.displayTime
    confInfo.custom.display.lookup = this.state.displayLookup
    confInfo.custom.commitTxConf.gasPrice = Number(this.state.commitGasPrice)
    confInfo.custom.commitTxConf.gasLimit = Number(this.state.commitGasLimit)
    confInfo.custom.commitTxConf.waitConfirms = Number(this.state.commitWaitConfirms)
    confInfo.custom.regTxConf.duration = Number(this.state.regDuration)
    confInfo.custom.regTxConf.value = String(this.state.regValue.trim())
    confInfo.custom.regTxConf.gasPrice = Number(this.state.regGasPrice)
    confInfo.custom.regTxConf.gasLimit = Number(this.state.regGasLimit)
    confInfo.custom.regTxConf.waitConfirms = Number(this.state.regWaitConfirms)
    confInfo.custom.regTxConf.registerWithConfig = Boolean(this.state.regRegisterWithConfig)
    confInfo.custom.book.timeSlot = Number(this.state.bookTimeSlot)
    confInfo.custom.donatePercentage = Number(this.state.donatePercentage)
    this.props.setAndStoreConfInfo(confInfo)
    this.props.updateNames(false)
  }

  resetConf = () => {
    this.props.resetAndStoreConfInfo()
    const initialCustomConf = this.props.confFile.custom
    this.setState({
      operatorPrivateKey: initialCustomConf.operatorPrivateKey.join(),
      network: initialCustomConf.network,
      receiverAddress: initialCustomConf.receiverAddress,
      infuraID: initialCustomConf.infuraID,
      pageTag: initialCustomConf.pageTag,
      pageTagColor: initialCustomConf.pageTagColor,
      displayTime: initialCustomConf.display.time,
      displayLookup: initialCustomConf.display.lookup,
      commitGasPrice: initialCustomConf.commitTxConf.gasPrice,
      commitGasLimit: initialCustomConf.commitTxConf.gasLimit,
      commitWaitConfirms: initialCustomConf.commitTxConf.waitConfirms,
      regDuration: initialCustomConf.regTxConf.duration,
      regValue: initialCustomConf.regTxConf.value,
      regGasPrice: initialCustomConf.regTxConf.gasPrice,
      regGasLimit: initialCustomConf.regTxConf.gasLimit,
      regWaitConfirms: initialCustomConf.regTxConf.waitConfirms,
      regRegisterWithConfig: initialCustomConf.regTxConf.registerWithConfig,
      bookTimeSlot: initialCustomConf.book.timeSlot,
      donatePercentage: initialCustomConf.donatePercentage
    })
    this.props.updateNames(false)
  }

  estimateGasPreparation = () => {
    const gasLimit = "270000"
    const gasPrice = utils.parseUnits(this.state.regGasPrice.toString(), 'gwei')
    const preparationWei = gasPrice.mul(gasLimit)
    const preparation = utils.formatEther(preparationWei)
    console.log('Gas preparation: ' + preparation + ' ETH')
  }

  render() {
    if (this.props.host !== "remote") {
      return null
    }

    const lookupList = JSON.parse(window.localStorage.getItem("lookupList"))

    const {t} = this.props

    const configureDivStyle = {
      display: 'inline-block',
      paddingRight: '0.5rem',
      textAlign: 'left'
    }
    const buttonBoxStyle = {
      padding: '0.65rem 1rem',
      borderTop: 'solid 1px gainsboro',
      backgroundColor: 'whitesmoke',
      display: 'flex',
      justifyContent: 'flex-end',
      width: '399px',
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 1030
    }
    const saveButtonStyle = {
      margin: '0 1rem'
    }
    const mb6 = {
      marginBottom: '3.8rem'
    }

    return (
      <div style={configureDivStyle}>
        <OverlayTrigger placement="bottom" overlay={<Tooltip>{t('conf.title')}</Tooltip>}>
          <button className="btn-plain" type="button" data-bs-toggle="offcanvas" data-bs-target="#configureContainer" aria-controls="configureContainer">
            <Gear />
          </button>
        </OverlayTrigger>
        <div className="offcanvas offcanvas-start" data-bs-scroll="true" tabIndex="-1" id="configureContainer" aria-labelledby="configureContainerLabel">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="configureContainerLabel"><Gear /> {t('conf.title')}</h5>
            <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div className="offcanvas-body">
            <form>
              <div className="alert alert-warning" role="alert">
                <InfoCircle />
                <a href={this.props.confFile.repository + t('conf.instructionsUrl')} className="alert-link ps-2" target="_blank" rel="noreferrer">
                  {t('conf.instructions')}
                  <BoxArrowUpRight className="external-link-icon" />
                </a>
                <hr />
                {t('conf.attention')}
              </div>
              <h6 className="mt-4 mb-3"><CaretRightFill /> {t('conf.global.title')}</h6>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-privatekey"
                onDoubleClick={this.logOperators}>
                  {t('conf.global.operatorPrivateKey')}
                </span>
                <input type="password" className="form-control" aria-label="operatorPrivateKey" aria-describedby="your-operatorPrivateKey" 
                name="operatorPrivateKey" 
                value={this.state.operatorPrivateKey} 
                onChange={this.handleChange} />
              </div>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-network">{t('conf.global.network')}</span>
                <select className="form-select form-select-sm" aria-label="network" 
                name="network"
                value={this.state.network} 
                onChange={this.handleChange} >
                  <option value="mainnet">{t('c.mainnet')}</option>
                  <option value="ropsten">{t('c.ropsten')}</option>
                </select>
              </div>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-receiverAddress">{t('conf.global.receiverAddress')}</span>
                <input type="text" className="form-control" aria-label="receiverAddress" aria-describedby="your-receiverAddress"
                name="receiverAddress" 
                value={this.state.receiverAddress} 
                onChange={this.handleChange} />
              </div>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-infuraid">{t('conf.global.infuraID')}</span>
                <input type="text" className="form-control" aria-label="infuraID" aria-describedby="your-infuraID" 
                name="infuraID" 
                value={this.state.infuraID} 
                onChange={this.handleChange} />
              </div>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-pageTag">
                  {t('conf.global.pageTag')}
                </span>
                <input type="text" 
                  className="form-control" 
                  aria-label="pageTag" 
                  aria-describedby="your-pageTag" 
                  name="pageTag" 
                  value={this.state.pageTag} 
                  onChange={this.handleChange} 
                />
                <span className="input-group-text page-tag-color-wrapper">
                  <Form.Control
                    type="color"
                    className="page-tag-color"
                    name="pageTagColor"
                    value={this.state.pageTagColor}
                    title={t('conf.global.pageTagColorTip')}
                    onChange={this.handleChange}
                  />
                </span>
              </div>

              <h6 className="mt-4 mb-3"><CaretRightFill /> {t('conf.display.title')}</h6>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-displayTime">{t('conf.display.time')}</span>
                <select className="form-select form-select-sm" aria-label="displayTime" 
                name="displayTime"
                value={this.state.displayTime} 
                onChange={this.handleChange} >
                  <option value="expiresTime">{t('c.expiresTime')}</option>
                  <option value="releaseTime">{t('c.releaseTime')}</option>
                </select>
              </div>
              <div className="lookup-display-wrapper">
              <div className="input-group input-group-sm" data-bs-toggle="collapse" data-bs-target="#lookupCheckField" aria-expanded="false" aria-controls="lookupCheckField">
                <span className="input-group-text">{t('conf.display.lookup')}</span>
                <span className="form-control text-end"><ChevronDown /></span>
              </div>
              <div id="lookupCheckField" className="accordion-collapse collapse" aria-labelledby="headingTwo">
                <div className="accordion-body">
                  {
                    lookupList.map(item => (
                        <div className="form-check" key={item}>
                          <input className="form-check-input lookup-check-input" 
                            type="checkbox" 
                            name={item} 
                            checked={this.state.displayLookup[item] ?? false} 
                            onChange={this.handleDisplayLookupChange}
                          />
                          <label className="form-check-label">{t('tb.lookup.' + item)}</label>
                        </div>
                      )
                    )
                  }
                </div>
              </div>
            </div>

            <h6 className="mt-4 mb-3"><CaretRightFill /> {t('conf.commit.title')}</h6>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-commit-gasprice">{t('conf.commit.gasPrice')}</span>
                <input type="text" className="form-control" aria-label="commitGasPrice" aria-describedby="your-commitGasPrice" 
                name="commitGasPrice" 
                value={this.state.commitGasPrice} 
                onChange={this.handleChange} />
                <span className="input-group-text">{t('c.gwei')}</span>
              </div>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-commit-gaslimit">{t('conf.commit.gasLimit')}</span>
                <input type="text" className="form-control" aria-label="commitGasLimit" aria-describedby="your-commitGasLimit" 
                name="commitGasLimit" 
                value={this.state.commitGasLimit} 
                onChange={this.handleChange} />
              </div>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-commit-waitconfirms">{t('conf.commit.waitConfirms')}</span>
                <input type="text" className="form-control" aria-label="commitWaitConfirms" aria-describedby="your-commitWaitConfirms" 
                name="commitWaitConfirms" 
                value={this.state.commitWaitConfirms} 
                onChange={this.handleChange} />
              </div>

              <h6 className="mt-4 mb-3"><CaretRightFill /> {t('conf.register.title')}</h6>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-reg-duration">{t('conf.register.duration')}</span>
                <input type="text" className="form-control" aria-label="regDuration" aria-describedby="your-Duration" 
                name="regDuration" 
                value={this.state.regDuration} 
                onChange={this.handleChange} />
                <span className="input-group-text">{t('c.days')}</span>
              </div>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-reg-value">{t('conf.register.value')}</span>
                <input type="text" className="form-control" aria-label="regValue" aria-describedby="your-Value" 
                name="regValue" 
                value={this.state.regValue} 
                onChange={this.handleChange} />
                <span className="input-group-text">{t('c.eth')}</span>
              </div>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-reg-gasprice"
                  onDoubleClick={this.estimateGasPreparation}
                >{t('conf.register.gasPrice')}</span>
                <input type="text" className="form-control" aria-label="regGasPrice" aria-describedby="your-regGasPrice" 
                name="regGasPrice" 
                value={this.state.regGasPrice} 
                onChange={this.handleChange} />
                <span className="input-group-text">{t('c.gwei')}</span>
              </div>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-reg-gaslimit">{t('conf.register.gasLimit')}</span>
                <input type="text" className="form-control" aria-label="regGasLimit" aria-describedby="your-regGasLimit" 
                name="regGasLimit" 
                value={this.state.regGasLimit} 
                onChange={this.handleChange} />
              </div>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-reg-waitconfirms">{t('conf.register.waitConfirms')}</span>
                <input type="text" className="form-control" aria-label="regWaitConfirms" aria-describedby="your-regWaitConfirms" 
                name="regWaitConfirms" 
                value={this.state.regWaitConfirms} 
                onChange={this.handleChange} />
              </div>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-reg-registerwithconfig">{t('conf.register.registerWithConfig')}</span>
                <select className="form-select form-select-sm" aria-label="regRegisterWihConfig" 
                name="regRegisterWithConfig" 
                value={this.state.regRegisterWithConfig} 
                onChange={this.handleSelectBooleanChange} >
                  <option value="true">{t('c.true')}</option>
                  <option value="false">{t('c.false')}</option>
                </select>
              </div>

              <h6 className="mt-4 mb-3"><CaretRightFill /> {t('conf.book.title')}</h6>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-book-activeduration">{t('conf.book.activeDuration')}</span>
                <input type="text" className="form-control" aria-label="bookActiveDuration" aria-describedby="your-bookActiveDuration" 
                name="bookActiveDuration" 
                value="24" 
                onChange={this.handleChange} 
                disabled={true} />
                <span className="input-group-text">{t('c.hours')}</span>
              </div>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-book-timeslot">{t('conf.book.timeSlot')}</span>
                <input type="text" className="form-control" aria-label="bookTimeSlot" aria-describedby="your-bookTimeSlot" 
                name="bookTimeSlot" 
                value={this.state.bookTimeSlot} 
                onChange={this.handleChange} />
                <span className="input-group-text">{t('c.seconds')}</span>
              </div>

              <h6 className="mt-4 mb-3"><Gift /> {t('conf.donate.title')}</h6>
              <div className="input-group input-group-sm" style={mb6}>
                <span className="input-group-text" id="conf-key-donate-percentage">{t('conf.donate.donatePercentage')}</span>
                <input type="text" className="form-control" aria-label="donatePercentage" aria-describedby="your-donatePercentage" 
                name="donatePercentage" 
                value={this.state.donatePercentage} 
                onChange={this.handleChange} />
                <span className="input-group-text">{t('c.percent')}</span>
              </div>

              <div className="fixed-bottom" style={buttonBoxStyle}>
                <button 
                  className="btn btn-secondary" 
                  type="button"
                  onClick={this.resetConf}
                >{t('c.reset')}</button>
                <button 
                  className="btn btn-primary" 
                  type="button" 
                  style={saveButtonStyle}
                  onClick={this.submitForm}
                >{t('c.save')} <CheckCircle /></button>
              </div>

            </form>
          </div>
        </div>
      </div>
    )
  }

}

export default ConfigureForm
