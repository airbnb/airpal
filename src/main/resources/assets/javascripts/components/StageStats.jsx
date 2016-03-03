import React from 'react/addons';
import StageStateConstants from '../constants/StageStateConstants';
import { Modal, ModalTrigger, ProgressBar } from 'react-bootstrap';

function getProgressForStage(stageStats) {
  if (!stageStats) {
    return 0.0;
  } else {
    return stageStats.completedSplits / stageStats.totalSplits * 100;
  }
}

function getBsStyleForState(state) {
  if (state === StageStateConstants.RUNNING) {
    return "info";
  } else if (state === StageStateConstants.FAILED) {
    return "danger";
  } else if ((state === StageStateConstants.QUEUED) || (state === StageStateConstants.SCHEDULING)) {
    return "warning";
  } else if (state === StageStateConstants.FINISHED) {
    return "success";
  } else {
    return "info";
  }
}

function getNestedProgressBars(stage, isRoot) {
  let arr = [];
  if (stage.subStages && stage.subStages.length > 0) {
    for (let i = 0; i < stage.subStages.length; i++) {
      arr.push(getNestedProgressBars(stage.subStages[i], false));
    }
  }
  return [React.createElement('li', {className: isRoot ? 'stage-progress-root' : 'stage-progress-child'},
	[React.createElement('span', null, "Stage: " + stage.stageId),
	 React.createElement(ProgressBar, 
	   {bsStyle: getBsStyleForState(stage.state), 
	    now: getProgressForStage(stage),
	    label: stage.completedSplits + "/" + stage.totalSplits
	    }, 
           null)]),
      React.createElement('ul', {className: "stage-progress"}, arr)];
}

function getStageProgress(run) {
      var stageProgress;
      if (run.stageStats) {
	stageProgress = getNestedProgressBars(run.stageStats, true);
      }
      return (<Modal title="Stage Progress" animation={false}>
        <div className="modal-body">
	    <ul className="stage-progress">
		{stageProgress}
	    </ul>
        </div>
      </Modal>);
}

export default getStageProgress;
