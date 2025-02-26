import {Tooltip} from "antd";
import {AlertTwoTone, CheckCircleTwoTone, ExclamationCircleTwoTone} from "@ant-design/icons";
import React from "react";

enum ResultTypes {
  DRIFTED = 'drifted',
  NO_DRIFT = 'no_drift',
  ERRORED = 'errored',
}

export interface Input {
  total_projects: number;
  total_projects_drifted: number;
}

const identifyResultType = (result: Input): ResultTypes => {
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
