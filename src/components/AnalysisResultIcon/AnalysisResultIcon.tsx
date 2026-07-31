import {Tooltip} from "antd";
import {AlertTwoTone, CheckCircleTwoTone, ExclamationCircleTwoTone, SyncOutlined} from "@ant-design/icons";
import React from "react";
import {RunStatus} from "../../model/AnalysisRun.ts";

enum ResultTypes {
  RUNNING = 'running',
  DRIFTED = 'drifted',
  NO_DRIFT = 'no_drift',
  ERRORED = 'errored',
}

export interface Input {
  total_projects: number;
  total_projects_drifted: number;
  status?: RunStatus;
}

const identifyResultType = (result: Input): ResultTypes => {
  // Checked before the drift/no-drift split: a live run's counters are still filling in, so a
  // green "no drifts detected" tick would be a claim the scan has not yet earned.
  if (result.status === 'RUNNING') {
    return ResultTypes.RUNNING;
  }
  if (result.total_projects_drifted > 0) {
    return ResultTypes.DRIFTED;
  } else if (result.total_projects === 0) {
    return ResultTypes.ERRORED;
  } else {
    return ResultTypes.NO_DRIFT;
  }
}

export interface AnalysisResultIconProps {
  item: Input;
}

export const AnalysisResultIcon: React.FC<AnalysisResultIconProps> = ({item}) => {
  const resultType = identifyResultType(item);
  switch (resultType) {
    case ResultTypes.RUNNING:
      return (
        <Tooltip title="Analysis in progress">
          <SyncOutlined spin style={{color: '#0891b2'}}/>
        </Tooltip>
      )
    case ResultTypes.DRIFTED:
      return (
        <Tooltip title={`Drifted projects: ${item.total_projects_drifted}`}>
          <AlertTwoTone twoToneColor="#eb2f32"/>
        </Tooltip>
      )
    case ResultTypes.ERRORED:
      return (
        <Tooltip title="Error">
          <ExclamationCircleTwoTone twoToneColor="#ff1100"/>
        </Tooltip>
      )
    case ResultTypes.NO_DRIFT:
      return (
        <Tooltip title="No drifts detected">
          <CheckCircleTwoTone twoToneColor="#52c41a"/>
        </Tooltip>
      )
  }
}
