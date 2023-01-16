import React from "react";
import { utils } from "ethers";
import { toast } from "react-toastify";
import namehash from "@ensdomains/eth-ens-namehash";
import { t } from "i18next";
import { getNamesOfOwner, isForAccount } from "../Global/globals";

class MainForm extends React.Component {
  state = {
    labels: "",
    adding: false,
  };

  handleLabels = (labels) => {
    labels = labels.replace(/[,.'"?!@#$%^&*()+=/\\\\]/g, " ").trim();

    if (labels.length) {
      const labelsSet = new Set(labels.split(/\s+/));

      // only retain the labels whose length >= 3
      let labelsArr = [...labelsSet].filter((label) => label.length >= 3);

      labelsArr.map((label, index) => {
        try {
          labelsArr[index] = namehash.normalize(label);
        } catch (err) {
          delete labelsArr[index];
        } //!!!!
        return null;
      });

      return labelsArr;
    }
    return [];
  };

  addNames = async (labels) => {
    const { nameInfo, setAndStoreNameInfo, updateNames, network, provider } =
      this.props;
    const account = await isForAccount(labels, provider, network);
    const labelsArr =
      account === false
        ? this.handleLabels(labels)
        : await getNamesOfOwner(account, network);

    if (labelsArr.length < 1) {
      return false;
    }

    // create an Array(originLabelsSet) including the original labels
    const originLabelsSet = new Set();
    nameInfo.map((row) => originLabelsSet.add(row.label));

    const diffLabelsArr = [
      ...new Set(labelsArr.filter((x) => !originLabelsSet.has(x))),
    ];
    diffLabelsArr.map((label) =>
      nameInfo.push({
        label: label,
        length: label.length,
        level: 0,
        status: "Unknown",
        tokenId: utils.id(label),
      })
    );
    setAndStoreNameInfo(nameInfo, false);

    // update the status of newly added names
    await updateNames(diffLabelsArr);

    toast.info(t("msg.setAndStoreNameInfo"));
  };

  handleChange = (event) => {
    const { value } = event.target;
    this.setState({ labels: value });
  };

  handleKeyDown = (event) => {
    if (event.key === "Enter") {
      this.submitForm();
      event.preventDefault();
      return false;
    }
  };

  submitForm = async () => {
    this.setState({ adding: true });
    const labels = this.state.labels.trim();
    await this.addNames(labels);
    this.setState({ labels: "" });
    this.setState({ adding: false });
    document.getElementById("labels").focus();
  };

  // Click the text box 3 times to display all current name labels.
  inputClickCount = 0;
  displayLabels = () => {
    this.inputClickCount += 1;
    setTimeout(() => {
      if (this.inputClickCount === 3) {
        const labels = this.props.nameInfo.map((item) => item.label).join(" ");
        this.setState({ labels: labels });
      }
      this.inputClickCount = 0;
    }, 500);
  };

  render() {
    const { labels, adding } = this.state;
    return (
      <form
        id="add-names-form"
        className="row g-3 mb-3 sticky-top add-names-form"
      >
        <div className="input-group mb-3">
          <input
            type="text"
            disabled={adding}
            className="form-control"
            autoComplete="off"
            name="labels"
            id="labels"
            autoFocus
            placeholder={t("form.holder")}
            value={labels}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            onClick={this.displayLabels}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.submitForm}
          >
            {t("form.btn")}
          </button>
        </div>
      </form>
    );
  }
}

export default MainForm;
