import React from 'react';
import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { Gear, InfoCircle, BoxArrowUpRight, CaretRightFill, ChevronDown, CheckCircle } from 'react-bootstrap-icons';
import confFile from '../../conf.json'

class ConfigureForm extends React.Component {
  conf = JSON.parse(window.localStorage.getItem("confInfo"))

  state = {
    pageTag: this.conf.custom.pageTag,
    pageTagColor: this.conf.custom.pageTagColor,
    infuraID: this.conf.custom.infuraID,
    displayLookup: this.conf.custom.display.lookup,

    regDuration: this.conf.custom.regTxConf.duration,
    regReceiver: this.conf.custom.regTxConf.receiver,
    regRegisterWithConfig: this.conf.custom.regTxConf.registerWithConfig,

    premiumPriceRange: this.conf.custom.premium.priceRange,

    walletOperatorPrivateKey: this.conf.custom.wallet.operatorPrivateKey.join(),
    walletNetwork: this.conf.custom.wallet.network,
    walletGasPrice: this.conf.custom.wallet.gasPrice
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

  setAndStoreConfInfo = (newConf) => { 
    window.localStorage.setItem("confInfo", JSON.stringify(newConf))
  }

  submitForm = () => {
    const confInfo = JSON.parse(window.localStorage.getItem("confInfo"))
    confInfo.custom.pageTag =  this.state.pageTag.trim()
    confInfo.custom.pageTagColor =  this.state.pageTagColor
    confInfo.custom.infuraID = this.state.infuraID.trim()
    confInfo.custom.display.lookup = this.state.displayLookup

    confInfo.custom.regTxConf.duration = Number(this.state.regDuration)
    confInfo.custom.regTxConf.receiver = this.state.regReceiver.trim()
    confInfo.custom.regTxConf.registerWithConfig = Boolean(this.state.regRegisterWithConfig)

    confInfo.custom.premium.priceRange = Number(this.state.premiumPriceRange)

    confInfo.custom.wallet.operatorPrivateKey = this.state.walletOperatorPrivateKey.replace(/\s/g, "").split(",")
    confInfo.custom.wallet.network  = this.state.wallet.network
    confInfo.custom.wallet.gasPrice = Number(this.state.walletGasPrice)
    this.setAndStoreConfInfo(confInfo)
    this.props.reconnectApp()
  }

  resetConf = () => {
    this.setAndStoreConfInfo(confFile)
    const initialCustomConf = confFile.custom
    this.setState({
      pageTag: initialCustomConf.pageTag,
      pageTagColor: initialCustomConf.pageTagColor,
      infuraID: initialCustomConf.infuraID,
      displayLookup: initialCustomConf.display.lookup,

      regDuration: initialCustomConf.regTxConf.duration,
      regReceiver: initialCustomConf.regTxConf.receiver,
      regRegisterWithConfig: initialCustomConf.regTxConf.registerWithConfig,

      premiumPriceRange: initialCustomConf.premium.priceRange,

      walletOperatorPrivateKey: initialCustomConf.wallet.operatorPrivateKey.join(),
      walletNetwork: initialCustomConf.wallet.network,
      walletGasPrice: initialCustomConf.wallet.gasPrice
    })
    this.props.reconnectApp()
  }

  render() {
    if (this.props.host !== "remote") {
      return null
    }

    const lookupList = JSON.parse(window.localStorage.getItem("lookupList"))
    const { t } = this.props

    return (
      <div className="ps-2 pe-3 d-inline-block text-start">
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
                <a href={confFile.repository + t('conf.instructionsUrl')} className="alert-link ps-2" target="_blank" rel="noreferrer">
                  {t('conf.instructions')}
                  <BoxArrowUpRight className="external-link-icon" />
                </a>
              </div>
              
              <h6 className="mt-4 mb-3"><CaretRightFill /> {t('conf.global.title')}</h6>
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
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-infuraid">{t('conf.global.infuraID')}</span>
                <input type="text" className="form-control" aria-label="infuraID" aria-describedby="your-infuraID" 
                name="infuraID" 
                value={this.state.infuraID} 
                onChange={this.handleChange} />
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

              <h6 className="mt-4 mb-3"><CaretRightFill /> {t('conf.register.title')}</h6>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-reg-duration">{t('conf.register.duration')}</span>
                <input type="text" className="form-control" aria-label="regDuration" aria-describedby="your-Duration" 
                name="regDuration" 
                value={this.state.regDuration} 
                onChange={this.handleChange} />
                <span className="input-group-text">{t('c.years')}</span>
              </div>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-regReceiver">{t('conf.global.regReceiver')}</span>
                <input type="text" className="form-control" aria-label="regReceiver" aria-describedby="your-regReceiver"
                name="regReceiver" 
                value={this.state.regReceiver} 
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

              <h6 className="mt-4 mb-3"><CaretRightFill /> {t('conf.premium.title')}</h6>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-premium-pricerange">{t('conf.premium.priceRange')}</span>
                <input type="text" className="form-control" aria-label="premiumPriceRange" aria-describedby="your-premiumPriceRange" 
                name="premiumPriceRange" 
                value={this.state.premiumPriceRange} 
                onChange={this.handleChange} />
                <span className="input-group-text">{t('c.dollars')}</span>
              </div>

              <h6 className="mt-4 mb-3"><CaretRightFill /> {t('conf.premium.title')}</h6>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-operatorPrivateKey">
                  {t('conf.global.operatorPrivateKey')}
                </span>
                <input type="password" className="form-control" aria-label="walletOperatorPrivateKey" aria-describedby="your-walletOperatorPrivateKey" 
                name="walletOperatorPrivateKey" 
                value={this.state.walletOperatorPrivateKey} 
                onChange={this.handleChange} />
              </div>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text" id="conf-key-walletNetwork">{t('conf.global.network')}</span>
                <select className="form-select form-select-sm" aria-label="walletNetwork" 
                name="walletNetwork"
                value={this.state.walletNetwork} 
                onChange={this.handleChange} >
                  <option value="mainnet">{t('c.mainnet')}</option>
                  <option value="ropsten">{t('c.ropsten')}</option>
                </select>
              </div>
              <div className="input-group input-group-sm mb-6">
                <span className="input-group-text" id="conf-key-wallet-gasprice">{t('conf.register.gasPrice')}</span>
                <input type="text" className="form-control" aria-label="walletGasPrice" aria-describedby="your-walletGasPrice" 
                name="walletGasPrice" 
                value={this.state.walletGasPrice} 
                onChange={this.handleChange} />
                <span className="input-group-text">{t('c.gwei')}</span>
              </div>

              <div className="fixed-bottom conf-btn-box">
                <button 
                  className="btn btn-secondary" 
                  type="button"
                  data-bs-dismiss="offcanvas" 
                  onClick={this.resetConf}
                >{t('c.reset')}</button>
                <button 
                  type="button" 
                  className="btn btn-primary conf-btn-save" 
                  data-bs-dismiss="offcanvas" 
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
