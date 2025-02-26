import React from "react";
import {Layout, Table, TableProps, Tooltip, Typography} from "antd";
import {GitOrganization} from "../../../model/GitOrganization.ts";
import {GitRepository} from "../../../model/GitRepository.ts";
import useAxios from "../../../context/auth/axios.ts";
import {useQuery} from "react-query";
import {isOk} from "../../../utils/axios.ts";
import {dayjs} from "../../../utils/dayjs.ts";
import {AnalysisResultIcon} from "../../../components/AnalysisResultIcon/AnalysisResultIcon.tsx";
import {useNavigate} from "react-router";

export interface RepoResultsTabProps {
  organization: GitOrganization;
  repository: GitRepository;
}

interface RepoAnalysisResult {
  uuid: string;
  repository_id: number;
  total_projects: number;
  total_projects_drifted: number;
  analysis_duration_millis: number;
  created_at: string;
}

export const RepoResultsTab: React.FC<RepoResultsTabProps> = ({organization, repository}) => {

  const navigate = useNavigate();
  const axios = useAxios();
  const [runsPage] = React.useState(0);
  const repoAnalysisRuns = useQuery({
    queryKey: ["getRepoAnalysisResults", repository],
    enabled: (!!repository) && (repository.id !== undefined && repository.id !== null),
    queryFn: async () => {
      const response = await axios.get(`/v1/repo/${repository.id}/runs?page=${runsPage}`);
      if (!isOk(response)) {
        throw new Error("Network response was not ok");
      }
      return response.data;
    },
  });

  const columns: TableProps<RepoAnalysisResult>['columns'] = [
    {
      key: 'icon',
      title: undefined,
      dataIndex: 'total_projects_drifted',
      render: (_, item) => {
        return (<AnalysisResultIcon item={item}/>);
      }
    },
    {
      key: 'projects',
      title: 'Projects',
      dataIndex: 'total_projects',
    },
    {
      key: 'drifted',
      title: 'Drifted',
      dataIndex: 'total_projects_drifted',
      render: (value) => {
        return (<Typography.Text type={value > 0 ? 'danger' : 'success'}>{value}</Typography.Text>);
      }
    },
    {
      key: 'duration',
      title: 'Duration',
      dataIndex: 'duration_millis',
      render: (value) => {
        return (<Tooltip title={dayjs.duration({milliseconds: value}).asSeconds() + 's'}>
            {dayjs.duration({milliseconds: value}).humanize(false)}
          </Tooltip>
        );
      }
    },
    {
      key: 'date',
      title: 'Date',
      dataIndex: 'created_at',
      render: (value) => {

        let label: string;
        let showTooltip = false;
        if (dayjs(new Date()).diff(dayjs(value), 'h') > 10) {
          label = dayjs(value).format('lll')
        } else {
          label = dayjs(value).fromNow();
          showTooltip = true;
        }

        if (showTooltip) {
          return (
            <Tooltip title={dayjs(value).format('lll')}>
              {label}
            </Tooltip>
          )
        } else {
          return <div>{label}</div>
        }
      }
    }
  ];

  return (
    <Layout style={{backgroundColor: '#fff'}}>
      <Layout.Content>

        <Table size="small"
               onRow={(record) => {
                 return {
                   "onClick": () => {
                     navigate(`/gh/${organization.name}/${repository.name}/run/${record.uuid}`);
                   },
                   "style": {cursor: 'pointer'}
                 }
               }}
               dataSource={repoAnalysisRuns.data}
               rowKey="uuid" columns={columns}
               loading={repoAnalysisRuns.isLoading}
        />

      </Layout.Content>
    </Layout>
  );

}
