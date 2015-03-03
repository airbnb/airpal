import alt from '../alt';
import FluxCollection from '../utils/FluxCollection';
import TabActions from '../actions/TabActions';
import TabConstants from '../constants/TabConstants';

class TabStore {
  constructor() {
    this.bindActions(TabActions);

    this.selectedTab = TabConstants.MY_RECENT_QUERIES;
  }

  onSelectTab(tab) {
    this.selectedTab = tab;
  }

  static getSelectedTab() {
    return this.getState().selectedTab;
  }
}

export default alt.createStore(TabStore, 'TabStore');
