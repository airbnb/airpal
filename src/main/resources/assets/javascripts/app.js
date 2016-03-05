/**
 * App Bootstrap
 */

import 'es6-shim';
import 'whatwg-fetch';
import StageStats from './components/StageStats';
import { Modal, ModalTrigger, ProgressBar } from 'react-bootstrap';
import React from 'react';
var test = {stageStats: {subStages: 
[{subStages: [{subStages: [], completedSplits: 7, totalSplits:10, state: 'RUNNING', stageId: "7"}], completedSplits: 7, totalSplits:10, state: 'RUNNING', stageId: "6"}, {subStages: 
[{subStages: [], completedSplits: 7, totalSplits:10, state: 'RUNNING', stageId: "4"},
{subStages: [], completedSplits: 7, totalSplits:10, state: 'RUNNING', stageId: "1"}], 
completedSplits: 6, totalSplits:10, state: 'RUNNING', stageId: "2"}], 
completedSplits: 5, totalSplits: 10, state: 'RUNNING', stageId: "3"}};
// Start the main app
React.render(
  <ModalTrigger modal={
	<Modal title="Stage Progress" animation={false}>
	  <div className="modal-body">
	    <StageStats run={test} />
	  </div>
	</Modal>}><span>click</span></ModalTrigger>,
  document.querySelector('.js-react-app')
);
