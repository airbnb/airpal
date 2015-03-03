import alt from '../alt'
import FluxCollection from '../utils/FluxCollection'
import TabActions from '../actions/TabActions'
import QueryApiUtils from '../utils/QueryApiUtils'
import logError from '../utils/logError'

class TabStore {
  constructor() {
    this.bindActions(TabActions);

    this.selectedTab = 1;
  }

  onSelectTab(tab) {
    this.selectedTab = tab;
  }

  static getSelectedTab() {
    return this.getState().selectedTab;
  }
}

export default alt.createStore(TabStore, 'TabStore');
