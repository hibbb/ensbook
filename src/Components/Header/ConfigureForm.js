import React from 'react';
import { 
  // Alert,
  Form, 
  OverlayTrigger, 
  Tooltip, 
  InputGroup, 
  FormControl
} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { faGear, faCaretRight, faWallet, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { t } from 'i18next';
import confFile from '../../conf.json'

class ConfigureForm extends React.Component {
  conf = JSON.parse(window.localStorage.getItem("confInfo"))

  state = {
    pageTag: this.conf.custom.pageTag,
    pageTagColor: this.conf.custom.pageTagColor,
    infuraID: this.conf.custom.infuraID,
    displayLookup: this.conf.custom.display.lookup,

    regReceiver: this.conf.custom.register.receiver,
    regDuration: this.conf.custom.register.duration,
    regRegisterWithConfig: this.conf.custom.register.registerWithConfig,

    renewDuration: this.conf.custom.renew.duration,

    premiumPriceUnit: this.conf.custom.premium.priceUnit ?? 'ETH',
    premiumPriceRange: this.conf.custom.premium.priceRange,

    walletSwitch: this.conf.custom.wallet.switch,
    walletOperatorPrivateKey: this.conf.custom.wallet.operatorPrivateKey.join(),
    walletNetwork: this.conf.custom.wallet.network,
    walletGasPrice: this.conf.custom.wallet.gasPrice
  }

  premiumPriceArray = [
    99999952, 49999952, 24999952, 12499952, 6249952, 3124952, 1562452, 781202,  
    390577, 195264, 97608, 48780, 24366, 12159, 6055, 3004, 1478, 715, 333, 143, 47, 0
  ]

  handleChange = (event) => {
    const {name, value} = event.target
    this.setState({[name]: value})
  }

  handleSwitchChange = (event) => {
    const {name, checked} = event.target
    this.setState({[name]: checked})
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
    confInfo.custom.pageTag =  this.state.pageTag.trim()
    confInfo.custom.pageTagColor =  this.state.pageTagColor
    confInfo.custom.infuraID = this.state.infuraID.trim()
    confInfo.custom.display.lookup = this.state.displayLookup

    confInfo.custom.register.receiver = this.state.regReceiver.trim()
    confInfo.custom.register.duration = Number(this.state.regDuration)
    confInfo.custom.register.registerWithConfig = Boolean(this.state.regRegisterWithConfig)

    confInfo.custom.renew.duration = Number(this.state.renewDuration)

    confInfo.custom.premium.priceUnit = this.state.premiumPriceUnit.trim()
    confInfo.custom.premium.priceRange = Number(this.state.premiumPriceRange)

    confInfo.custom.wallet.switch  = this.state.walletSwitch
    confInfo.custom.wallet.operatorPrivateKey = this.state.walletOperatorPrivateKey.replace(/\s/g, "").split(",")
    confInfo.custom.wallet.network  = this.state.walletNetwork
    confInfo.custom.wallet.gasPrice = Number(this.state.walletGasPrice)
    this.props.setAndStoreConfInfo(confInfo)
    this.props.reconnectApp()
  }

  resetConf = () => {
    const initialCustomConf = confFile.custom
    this.setState({
      pageTag: initialCustomConf.pageTag,
      pageTagColor: initialCustomConf.pageTagColor,
      infuraID: initialCustomConf.infuraID,
      displayLookup: initialCustomConf.display.lookup,

      regReceiver: initialCustomConf.register.receiver,
      regDuration: initialCustomConf.register.duration,
      regRegisterWithConfig: initialCustomConf.register.registerWithConfig,

      renewDuration: initialCustomConf.renew.duration,

      premiumPriceUnit: initialCustomConf.premium.priceUnit,
      premiumPriceRange: initialCustomConf.premium.priceRange,

      walletSwitch: initialCustomConf.wallet.switch,
      walletOperatorPrivateKey: initialCustomConf.wallet.operatorPrivateKey.join(),
      walletNetwork: initialCustomConf.wallet.network,
      walletGasPrice: initialCustomConf.wallet.gasPrice
    })
    this.props.setAndStoreConfInfo(confFile)
    this.props.reconnectApp()
  }

  render() {
    if (this.props.host !== "remote") {
      return null
    }

    const lookupList = JSON.parse(window.localStorage.getItem("lookupList"))

    return (
      <div className="ps-2 pe-3 d-inline-block text-start">
        <OverlayTrigger placement="bottom" overlay={<Tooltip>{t('conf.title')}</Tooltip>}>
          <button className="btn-plain" type="button" data-bs-toggle="offcanvas" data-bs-target="#configureContainer" aria-controls="configureContainer">
            <FontAwesomeIcon icon={faGear} />
          </button>
        </OverlayTrigger>
        <div className="offcanvas offcanvas-start" data-bs-scroll="true" tabIndex="-1" id="configureContainer" aria-labelledby="configureContainerLabel">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="configureContainerLabel"><FontAwesomeIcon icon={faGear} /> {t('conf.title')}</h5>
            <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div className="offcanvas-body">
            <form>
              {/* <Alert variant="warning">
                <InfoCircle />
                <a href={confFile.repository + t('conf.instructionsUrl')} className="alert-link ps-2" target="_blank" rel="noreferrer">
                  {t('conf.instructions')}
                  <BoxArrowUpRight className="external-link-icon" />
                </a>
              </Alert> */}

              {/* General */}
              <h6 className="mt-4 mb-3"><FontAwesomeIcon icon={faCaretRight} /> {t('conf.general.title')}</h6>
              <InputGroup className="mb-2" size="sm">
                <InputGroup.Text>{t('conf.general.pageTag')}</InputGroup.Text>
                <FormControl 
                  name="pageTag" 
                  value={this.state.pageTag} 
                  onChange={this.handleChange}  
                  aria-label="pageTag" />
                <span className="input-group-text page-tag-color-wrapper">
                  <Form.Control
                    type="color"
                    className="page-tag-color"
                    name="pageTagColor"
                    value={this.state.pageTagColor}
                    title={t('conf.general.pageTagColorTip')}
                    onChange={this.handleChange}
                  />
                </span>
              </InputGroup>
              <InputGroup className="mb-2" size="sm">
                <InputGroup.Text>{t('conf.general.infuraID')}</InputGroup.Text>
                <FormControl 
                  name="infuraID" 
                  value={this.state.infuraID} 
                  onChange={this.handleChange} 
                  aria-label="infuraID" />
              </InputGroup>
              <InputGroup size="sm" data-bs-toggle="collapse" data-bs-target="#lookupCheckField" aria-expanded="false" aria-controls="lookupCheckField">
                <InputGroup.Text>{t('conf.display.lookup')}</InputGroup.Text>
                <span className="form-control text-end"><FontAwesomeIcon icon={faChevronDown} /></span>
              </InputGroup>
              <div id="lookupCheckField" className="accordion-collapse collapse" aria-labelledby="lookupArea">
                <div className="accordion-body lookup-accordion-body">
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

              {/* Register */}
              <h6 className="mt-4 mb-3"><FontAwesomeIcon icon={faCaretRight} /> {t('conf.register.title')}</h6>
              <InputGroup className="mb-2" size="sm">
                <InputGroup.Text>{t('conf.register.duration')}</InputGroup.Text>
                <FormControl 
                  name="regDuration" 
                  value={this.state.regDuration}
                  onChange={this.handleChange} 
                  aria-label="regDuration" />
                <InputGroup.Text>{t('c.years')}</InputGroup.Text>
              </InputGroup>
              <InputGroup className="mb-2" size="sm">
                <InputGroup.Text>{t('conf.register.receiver')}</InputGroup.Text>
                <FormControl 
                  name="regReceiver" 
                  value={this.state.regReceiver} 
                  onChange={this.handleChange} 
                  aria-label="regReceiver" />
              </InputGroup>
              <InputGroup className="mb-2" size="sm">
                <InputGroup.Text>{t('conf.register.registerWithConfig')}</InputGroup.Text>
                <Form.Select 
                  name="regRegisterWithConfig" 
                  value={this.state.regRegisterWithConfig} 
                  onChange={this.handleSelectBooleanChange} 
                  aria-label="regRegisterWithConfig">
                  <option value="true">{t('c.true')}</option>
                  <option value="false">{t('c.false')}</option>
                </Form.Select>
              </InputGroup>

              {/* Renew */}
              <h6 className="mt-4 mb-3"><FontAwesomeIcon icon={faCaretRight} /> {t('conf.renew.title')}</h6>
              <InputGroup className="mb-2" size="sm">
                <InputGroup.Text>{t('conf.renew.duration')}</InputGroup.Text>
                <FormControl 
                  name="renewDuration" 
                  value={this.state.renewDuration} 
                  onChange={this.handleChange} 
                  aria-label="renewDuration" />
                <InputGroup.Text>{t('c.years')}</InputGroup.Text>
              </InputGroup>

              {/* Premium */}
              <h6 className="mt-4 mb-3"><FontAwesomeIcon icon={faCaretRight} /> {t('conf.premium.title')}</h6>
              <InputGroup className="mb-2" size="sm">
                <InputGroup.Text>{t('conf.premium.priceUnit')}</InputGroup.Text>
                <Form.Select 
                  name="premiumPriceUnit" 
                  value={this.state.premiumPriceUnit}
                  onChange={this.handleChange} 
                  aria-label="premiumPriceUnit">
                  <option value="ETH">{"ETH"}</option>
                  <option value="USD">{"USD"}</option>
                </Form.Select>
              </InputGroup>
              <InputGroup className="mb-2" size="sm">
                <InputGroup.Text>{t('conf.premium.priceRange')}</InputGroup.Text>
                <InputGroup.Text>{"≤"}</InputGroup.Text>
                <FormControl 
                  name="premiumPriceRange" 
                  value={this.state.premiumPriceRange} 
                  onChange={this.handleChange} 
                  aria-label="premiumPriceRange" />

                {/* Old version for EP9, before 2022.12
                <Form.Select 
                  name="premiumPriceRange" 
                  value={this.state.premiumPriceRange} 
                  onChange={this.handleChange} 
                  aria-label="premiumPriceRange">
                  {
                    this.premiumPriceArray.map(
                      (item, index) => index > 8
                        ? <option key={index} value={index}>{item}</option>
                        : null
                    )
                  }
                </Form.Select>
                */}
                <InputGroup.Text>{this.state.premiumPriceUnit}</InputGroup.Text>
              </InputGroup>

              {/* Custom Wallet Mode */}
              <h6 className="mt-4 mb-3">
                <FontAwesomeIcon icon={faWallet} className="me-2" />
                {t('conf.customMode.title')}
                <Form.Check 
                  type="switch"
                  className="ms-3 mt-0 custom-wallet-switch"
                  inline
                  name="walletSwitch"
                  checked={this.state.walletSwitch}
                  onChange={this.handleSwitchChange}
                />
              </h6>
              <InputGroup className={"mb-2 custom-wallet-" + Boolean(this.state.walletSwitch)} size="sm">
                <InputGroup.Text>{t('conf.customMode.operatorPrivateKey')}</InputGroup.Text>
                <Form.Control type="password" 
                  name="walletOperatorPrivateKey" 
                  value={this.state.walletOperatorPrivateKey} 
                  onChange={this.handleChange} 
                  disabled={!this.state.walletSwitch}
                  aria-label="walletOperatorPrivateKey" />
              </InputGroup>
              <InputGroup className={"mb-2 custom-wallet-" + Boolean(this.state.walletSwitch)} size="sm">
                <InputGroup.Text>{t('conf.customMode.network')}</InputGroup.Text>
                <Form.Select 
                  name="walletNetwork"
                  value={this.state.walletNetwork} 
                  onChange={this.handleChange} 
                  disabled={!this.state.walletSwitch}
                  aria-label="walletNetwork">
                  <option value="mainnet">{t('c.mainnet')}</option>
                  <option value="goerli">{t('c.goerli')}</option>
                </Form.Select>
              </InputGroup>
              <InputGroup className={"mb-6 custom-wallet-" + Boolean(this.state.walletSwitch)} size="sm">
                <InputGroup.Text>{t('conf.customMode.gasPrice')}</InputGroup.Text>
                <FormControl 
                  name="walletGasPrice" 
                  value={this.state.walletGasPrice} 
                  onChange={this.handleChange} 
                  disabled={!this.state.walletSwitch}
                  aria-label="walletGasPrice" />
                <InputGroup.Text>{t('c.gwei')}</InputGroup.Text>
              </InputGroup>

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
                >{t('c.save')} <FontAwesomeIcon icon={faCircleCheck} /></button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

}

export default ConfigureForm
