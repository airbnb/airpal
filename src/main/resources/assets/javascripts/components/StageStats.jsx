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

/**
 * Get the total number of substages that appear in a given
 * subtree of the stage tree, rooted at the given stage.
 */
function getTreeSize(stage) {
  let total = 1;
  if (stage.subStages && stage.subStages.length > 0) {
    for (let i = 0; i < stage.subStages.length; i++) {
	total += getTreeSize(stage.subStages[i]);
    }
  }
  return total;
}


function getClassName(nStagesAbove) {
  return 'stage-progress-child-' + nStagesAbove;
}

function getNestedProgressBars(stage, isRoot, nStagesAbove) {
  let arr = [];
  if (stage.subStages && stage.subStages.length > 0) {
    for (let i = 0; i < stage.subStages.length; i++) {
      if (i > 0) {
	arr.push(getNestedProgressBars(stage.subStages[i], false, getTreeSize(stage.subStages[i-1])));
      } else {
	arr.push(getNestedProgressBars(stage.subStages[i], false, 0));
      }
    }
  }
  let classes = (isRoot ? 'stage-progress-root' : 'stage-progress-child');
  if (!isRoot) {
    classes += (" " + getClassName(nStagesAbove));
  }
  return [
    React.createElement('li', 
	{className: classes},
	[React.createElement('span', null, "Stage: " + stage.stageId),
	 React.createElement(
	    ProgressBar, 
	    {bsStyle: getBsStyleForState(stage.state), 
	     now: getProgressForStage(stage),
	     label: stage.completedSplits + "/" + stage.totalSplits}, 
	    null)]),
    React.createElement('ul', {className: "stage-progress"}, arr)];
}

let StageStats = React.createClass({
  propTypes: {
    run: React.PropTypes.object.isRequired
  },
  render: function() {
    console.log(this);
    var stageProgress;
    if (this.props.run.stageStats) {
      stageProgress = getNestedProgressBars(this.props.run.stageStats, true);
    }
    return (<ul className="stage-progress">{stageProgress}</ul>);
  }
});

export default StageStats;
