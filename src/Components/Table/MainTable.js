import React from "react";
import { TableHead } from "./TableHead";
import { TableBody } from "./TableBody";
import { isStatus, removeRegInfo } from "../Global/globals";

class MainTable extends React.Component {
  componentDidMount() {
    this.props.reconnectApp();
  }

  // Hide unregistrable names or not
  state = {
    hideNames: false,
    regList: [],
    renewList: [],
  };

  addNameToRegList = (label) => {
    const { regList } = this.state;
    regList.push(label);
    this.setState({ regList: [...new Set(regList)] });
  };

  removeNameFromRegList = (label) => {
    const regList = this.state.regList.filter((item) => item !== label);
    this.setState({ regList });
  };

  clearRegList = () => {
    this.setState({ regList: [] });
    const regCheckboxes = document.getElementsByClassName("reg-checkbox");
    for (let i = 0; i < regCheckboxes.length; i++) {
      regCheckboxes[i].checked = false;
    }
  };

  addNameToRenewList = (label) => {
    const { renewList } = this.state;
    renewList.push(label);
    this.setState({ renewList: [...new Set(renewList)] });
  };

  removeNameFromRenewList = (label) => {
    const renewList = this.state.renewList.filter((item) => item !== label);
    this.setState({ renewList });
  };

  clearRenewList = () => {
    this.setState({ renewList: [] });
    const renewCheckboxes = document.getElementsByClassName("renew-checkbox");
    for (let i = 0; i < renewCheckboxes.length; i++) {
      renewCheckboxes[i].checked = false;
    }
  };

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
      ethPrice,
      reconnecting,
      fetching,
      registerName,
      registerNameEnd,
      registerNames,
      registerNamesEnd,
      renewMsges,
      renewName,
      renewNameEnd,
      renewNames,
      renewNamesEnd,
      regMsges,
      regsMsges,
      renewsMsges,
      setAndStoreNameInfo,
      updateNames,
    } = this.props;

    const { hideNames, regList, renewList } = this.state;

    const switchHideFlag = () => {
      this.setState({ hideNames: !hideNames });
      setAndStoreNameInfo(nameInfo, false);
    };

    const removeName = (index) => {
      const currentRegCheckBox = document.getElementById(
        "registerName-checkbox-" + nameInfo[index].label
      );
      const currentRenewCheckBox = document.getElementById(
        "renewName-checkbox-" + nameInfo[index].label
      );
      if (currentRegCheckBox) currentRegCheckBox.checked = false;
      if (currentRenewCheckBox) currentRenewCheckBox.checked = false;

      this.removeNameFromRegList(nameInfo[index].label);
      this.removeNameFromRenewList(nameInfo[index].label);

      removeRegInfo(nameInfo[index].label);
      Promise.all(
        nameInfo.filter((item, i) => {
          return i !== index;
        })
      ).then((nameInfo) => {
        setAndStoreNameInfo(nameInfo);
      });
    };

    const removeNames = (flag) => {
      // will remove all the items of lowest level by one click
      this.clearRegList();
      this.clearRenewList();

      if (isStatus(flag)) {
        Promise.all(nameInfo.filter((item) => item.status !== flag)).then(
          (nameInfo) => setAndStoreNameInfo(nameInfo)
        );
      } else if (flag === "Lower") {
        let lowerLevel = 9; // should be equal or higher than the possible highest level
        nameInfo.forEach((e) => {
          lowerLevel = Math.min(e.level, lowerLevel);
        }); // find the lowest level

        Promise.all(nameInfo.filter((item) => item.level > lowerLevel)).then(
          (nameInfo) => {
            setAndStoreNameInfo(nameInfo);
          }
        );
      } else if (flag === "All") {
        setAndStoreNameInfo([]);
      }
    };

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
            ethPrice={ethPrice}
            nameInfo={nameInfo}
            setAndStoreNameInfo={setAndStoreNameInfo}
            conf={conf}
            updateNames={updateNames}
            registerName={registerName}
            registerNameEnd={registerNameEnd}
            addNameToRegList={this.addNameToRegList}
            removeNameFromRegList={this.removeNameFromRegList}
            addNameToRenewList={this.addNameToRenewList}
            removeNameFromRenewList={this.removeNameFromRenewList}
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
    );
  }
}

export default MainTable;
