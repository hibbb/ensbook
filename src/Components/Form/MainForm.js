import React from 'react';
import { utils } from 'ethers';
import { toast } from 'react-toastify';
import namehash from '@ensdomains/eth-ens-namehash';
import { t } from 'i18next';
import { getNamesOfOwner, isForAccount } from '../Global/globals';

class MainForm extends React.Component {
  state = {
    labels: '',
    adding: false,
  };

  // 处理在文本框中输入的内容
  handleLabels = (_labels) => {
    const labels = _labels.replace(/[,.'"?!@#$%^&*()+=/\\\\]/g, ' ').trim();

    if (labels.length) {
      const labelsSet = new Set(labels.split(/\s+/));
  
      // only retain the labels whose length >= 3
      const labelsArr = [...labelsSet].filter((label) => label.length >= 3);

      labelsArr.map((label, index) => {
        try {
          labelsArr[index] = namehash.normalize(label);
        } catch (err) {
          console.log('Error from: namehash.normalize()')
          delete labelsArr[index];
        } //!!!!
        return null;
      });
      console.log('Normalized labels:', labelsArr)

      return labelsArr;
    }
    return [];
  };

  // 向 nameInfo 中添加名称并更新名称信息
  addNames = async (labels) => {
    const { nameInfo, setAndStoreNameInfo, updateNames, network } =
      this.props;
    const account = await isForAccount(labels, network);
    
    let labelsArr
    
    if (account) {
      labelsArr = await getNamesOfOwner(account, network)
    } else {
      labelsArr = this.handleLabels(labels)
    }
    console.log("labelsArr: ", labelsArr)

    if (labelsArr.length < 1) {
      console.log('Warning: No eligible label to add.')
      return false;
    }

    // create an Array(originLabelsSet) including the original labels
    const originLabelsSet = new Set();
    nameInfo.map((row) => originLabelsSet.add(row.label));

    const diffLabelsArr = [
      ...new Set(labelsArr.filter((x) => !originLabelsSet.has(x))),
    ];

    if (diffLabelsArr.length < 1) {
      console.log('Warning: No new label to add.')
      return false;
    }

    diffLabelsArr.map((label) =>
      nameInfo.push({
        label: label,
        length: label.length,
        level: 0,
        status: 'Unknown',
        tokenId: utils.id(label),
      })
    );
    setAndStoreNameInfo(nameInfo, false);

    // update the status of newly added names
    await updateNames(diffLabelsArr);

    toast.info(t('msg.setAndStoreNameInfo'));
  };

  handleChange = (event) => {
    const { value } = event.target;
    this.setState({ labels: value });
  };

  handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      this.submitForm();
      event.preventDefault();
      return false;
    }
  };

  submitForm = async () => {
    this.setState({ adding: true });
    const labels = this.state.labels.trim();
    await this.addNames(labels);
    this.setState({ labels: '' });
    this.setState({ adding: false });
    document.getElementById('labels').focus();
  };

  // Click the text box 3 times to display all current name labels.
  inputClickCount = 0;

  clearClickCount = () => {
    if (this.inputClickCount === 3) {
      const labels = this.props.nameInfo.map((item) => item.label).join(' ');
      this.setState({ labels: labels });
    }
    this.inputClickCount = 0;
  };

  displayLabels = () => {
    this.inputClickCount += 1;
    setTimeout(this.clearClickCount, 500);
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
            // biome-ignore lint/a11y/noAutofocus: <explanation>
            autoFocus
            placeholder={t('form.holder')}
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
            {t('form.btn')}
          </button>
        </div>
      </form>
    );
  }
}

export default MainForm;
