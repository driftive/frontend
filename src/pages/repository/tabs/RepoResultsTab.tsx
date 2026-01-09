import React from "react";
import {Alert, Button, Card, Empty, Space, Statistic, Table, TableProps, Tooltip, Typography} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  ReloadOutlined,
  RocketOutlined,
  WarningOutlined
} from "@ant-design/icons";
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

interface RepositoryRunStats {
  total_runs: number;
  runs_with_drift: number;
  last_run_at: string | null;
  latest_run: RepoAnalysisResult | null;
}

export const RepoResultsTab: React.FC<RepoResultsTabProps> = ({organization, repository}) => {

  const navigate = useNavigate();
  const axios = useAxios();
  const [runsPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);

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

  const repoStatsQuery = useQuery({
    queryKey: ["getRepoStats", repository?.id],
    enabled: (!!repository) && (repository.id !== undefined && repository.id !== null),
    queryFn: async () => {
      const response = await axios.get<RepositoryRunStats>(`/v1/repo/${repository.id}/stats`);
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
      sorter: (a, b) => a.total_projects - b.total_projects,
    },
    {
      key: 'drifted',
      title: 'Drifted',
      dataIndex: 'total_projects_drifted',
      sorter: (a, b) => a.total_projects_drifted - b.total_projects_drifted,
      render: (value) => {
        return (<Typography.Text type={value > 0 ? 'danger' : 'success'}>{value}</Typography.Text>);
      }
    },
    {
      key: 'duration',
      title: 'Duration',
      dataIndex: 'duration_millis',
      sorter: (a, b) => (a.analysis_duration_millis ?? 0) - (b.analysis_duration_millis ?? 0),
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
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
      defaultSortOrder: 'descend',
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

  const isEmpty = !repoAnalysisRuns.isLoading && !repoAnalysisRuns.isError && repoAnalysisRuns.data?.length === 0;

  const stats = repoStatsQuery.data;

  return (
    <div>
      {/* Summary Statistics */}
      {stats && !repoStatsQuery.isLoading && !repoStatsQuery.isError && stats.total_runs > 0 && (
        <Card size="small" style={{marginBottom: 16, backgroundColor: '#fafafa', borderRadius: 8}}>
          <Space size="large" wrap>
            <Statistic
              title="Total Runs"
              value={stats.total_runs}
              prefix={<HistoryOutlined />}
            />
            <Statistic
              title="Runs with Drift"
              value={stats.runs_with_drift}
              valueStyle={{color: stats.runs_with_drift > 0 ? '#cf1322' : '#3f8600'}}
              prefix={<WarningOutlined />}
            />
            <Tooltip title={stats.last_run_at ? dayjs(stats.last_run_at).format('lll') : ''}>
              <Statistic
                title="Last Run"
                value={stats.last_run_at ? dayjs(stats.last_run_at).fromNow() : 'N/A'}
                prefix={<ClockCircleOutlined />}
              />
            </Tooltip>
            <Statistic
              title="Last Run Status"
              value={stats.latest_run && stats.latest_run.total_projects_drifted > 0 ? `${stats.latest_run.total_projects_drifted} drifted` : 'No drift'}
              valueStyle={{color: stats.latest_run && stats.latest_run.total_projects_drifted > 0 ? '#cf1322' : '#3f8600'}}
              prefix={stats.latest_run && stats.latest_run.total_projects_drifted > 0 ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
            />
          </Space>
        </Card>
      )}

        {repoAnalysisRuns.isError ? (
          <Alert
            title="Failed to load analysis results"
            description="We couldn't fetch the analysis results. Please try again."
            type="error"
            showIcon
            action={
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => repoAnalysisRuns.refetch()}
              >
                Retry
              </Button>
            }
          />
        ) : isEmpty ? (
          <Empty
            image={<RocketOutlined style={{fontSize: 48, color: '#bfbfbf'}} />}
            description={
              <Space orientation="vertical" size="small">
                <Typography.Text>No analysis results yet</Typography.Text>
                <Typography.Text type="secondary">
                  Run Driftive on your repository to see drift detection results here
                </Typography.Text>
              </Space>
            }
            style={{padding: '48px 0'}}
          />
        ) : (
          <Table size="small"
                 onRow={(record) => {
                   return {
                     "onClick": () => {
                       navigate(`/gh/${organization.name}/${repository.name}/run/${record.uuid}`);
                     },
                     "onKeyDown": (e) => {
                       if (e.key === 'Enter' || e.key === ' ') {
                         e.preventDefault();
                         navigate(`/gh/${organization.name}/${repository.name}/run/${record.uuid}`);
                       }
                     },
                     "style": {cursor: 'pointer'},
                     "tabIndex": 0,
                     "role": "button",
                     "aria-label": `View analysis run from ${dayjs(record.created_at).format('lll')}, ${record.total_projects_drifted} drifted projects`
                   }
                 }}
                 dataSource={repoAnalysisRuns.data}
                 rowKey="uuid"
                 columns={columns}
                 loading={repoAnalysisRuns.isLoading}
                 pagination={{
                   pageSize: pageSize,
                   showSizeChanger: true,
                   pageSizeOptions: ['10', '20', '50'],
                   showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} runs`,
                   onChange: (_page, newPageSize) => {
                     if (newPageSize !== pageSize) {
                       setPageSize(newPageSize);
                     }
                   },
                 }}
          />
        )}
    </div>
  );

}
