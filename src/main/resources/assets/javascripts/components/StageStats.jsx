import React from 'react/addons';
import StageStateConstants from '../constants/StageStateConstants';
import ProgressBar from 'react-bootstrap';

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

/**
 * Recursively iterate through the stage tree and create an appropriate
 * progress bar element for each stage.
 */
function getNestedProgressBars(stage, isRoot, nStagesAbove) {
  let arr = [];
  if (stage.subStages && stage.subStages.length > 0) {
    for (let i = 0; i < stage.subStages.length; i++) {
      let childNStagesAbove = 0;
      if (i > 0) {
	childNStagesAbove = getTreeSize(stage.subStages[i-1]);
      }
      arr.push(getNestedProgressBars(stage.subStages[i], false, childNStagesAbove));
    }
  }
  let classes = (isRoot ? 'stage-progress-root' : 'stage-progress-child');
  // This class will add the appropriate before:: pseudo-element for the given position
  // in the hierarchical list.
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
    var stageProgress;
    if (this.props.run.stageStats) {
      stageProgress = getNestedProgressBars(this.props.run.stageStats, true);
    }
    return (<ul className="stage-progress">{stageProgress}</ul>);
  }
});

export default StageStats;
