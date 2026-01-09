import React from "react";
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Drawer,
  Empty,
  Input,
  message,
  Segmented,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography
} from "antd";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {dracula} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {useQuery} from "react-query";
import {Link, useParams} from "react-router";
import useAxios from "../../context/auth/axios.ts";
import {isOk} from "../../utils/axios.ts";
import {PageContainer} from "../../components/PageWrapper/PageWrapper.tsx";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  ProjectOutlined,
  ReloadOutlined,
  SearchOutlined,
  WarningOutlined
} from "@ant-design/icons";
import {dayjs} from "../../utils/dayjs.ts";

interface ProjectAnalysisRun {
  id: number;
  run_id: string;
  dir: string;
  type: string;
  drifted: boolean;
  succeeded: boolean;
  init_output: string;
  plan_output: string;
}

interface AnalysisRun {
  uuid: string;
  repository_id: number;
  total_projects: number;
  total_projects_drifted: number;
  duration_millis: number;
  created_at: string;
  updated_at: string;
  projects: ProjectAnalysisRun[];
}

type StatusFilter = 'all' | 'drifted' | 'errored' | 'ok';

const RunResultPage: React.FC = () => {
  const [searchText, setSearchText] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('drifted');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<ProjectAnalysisRun | null>(null);

  const axios = useAxios();
  const {org: orgName, repo: repoName, run: runUuid} = useParams();

  const runQuery = useQuery({
    queryKey: ["getRun", runUuid],
    enabled: !!runUuid,
    queryFn: async () => {
      const response = await axios.get<AnalysisRun>(`/v1/analysis/run/${runUuid}`);
      if (!isOk(response)) {
        throw new Error("Network response was not ok");
      }
      return response.data;
    }
  });

  const run = runQuery.data;
  const allProjects = run?.projects ?? [];

  // Filter projects based on search text and status filter
  const filteredProjects = React.useMemo(() => {
    return allProjects.filter((project) => {
      // Text filter
      const matchesSearch = searchText === '' ||
        project.dir.toLowerCase().includes(searchText.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'drifted') {
        matchesStatus = project.drifted && project.succeeded;
      } else if (statusFilter === 'errored') {
        matchesStatus = !project.succeeded;
      } else if (statusFilter === 'ok') {
        matchesStatus = !project.drifted && project.succeeded;
      }

      return matchesSearch && matchesStatus;
    });
  }, [allProjects, searchText, statusFilter]);

  // Calculate counts for filter badges
  const counts = React.useMemo(() => {
    const drifted = allProjects.filter(p => p.drifted && p.succeeded).length;
    const errored = allProjects.filter(p => !p.succeeded).length;
    const ok = allProjects.filter(p => !p.drifted && p.succeeded).length;
    return {drifted, errored, ok, all: allProjects.length};
  }, [allProjects]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('Output copied to clipboard');
    } catch {
      message.error('Failed to copy output');
    }
  };

  const openProjectDrawer = (project: ProjectAnalysisRun) => {
    setSelectedProject(project);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedProject(null);
  };

  const getProjectStatus = (project: ProjectAnalysisRun) => {
    if (!project.succeeded) {
      return {tag: <Tag icon={<ExclamationCircleOutlined/>} color="error">Error</Tag>, label: 'Error'};
    }
    if (project.drifted) {
      return {tag: <Tag icon={<WarningOutlined/>} color="warning">Drifted</Tag>, label: 'Drifted'};
    }
    return {tag: <Tag icon={<CheckCircleOutlined/>} color="success">OK</Tag>, label: 'OK'};
  };

  const columns = [
    {
      title: 'Project',
      dataIndex: 'dir',
      key: 'dir',
      ellipsis: true,
      sorter: (a: ProjectAnalysisRun, b: ProjectAnalysisRun) => a.dir.localeCompare(b.dir),
      render: (dir: string) => (
        <Tooltip title={dir}>
          <Typography.Text code style={{fontSize: '12px'}}>{dir}</Typography.Text>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      sorter: (a: ProjectAnalysisRun, b: ProjectAnalysisRun) => {
        const getStatusOrder = (p: ProjectAnalysisRun) => {
          if (!p.succeeded) return 0; // Error first
          if (p.drifted) return 1; // Drifted second
          return 2; // OK last
        };
        return getStatusOrder(a) - getStatusOrder(b);
      },
      render: (_: React.ReactNode, record: ProjectAnalysisRun) => getProjectStatus(record).tag,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      sorter: (a: ProjectAnalysisRun, b: ProjectAnalysisRun) => a.type.localeCompare(b.type),
      render: (type: string) => (
        <Tag>{type}</Tag>
      ),
    },
  ];

  const shortUuid = runUuid?.slice(0, 8) ?? '';
  const selectedOutput = selectedProject?.plan_output || selectedProject?.init_output || 'No output available';

  return (
    <PageContainer>
      <Card
        style={{
          width: '90%',
          maxWidth: '1400px',
          margin: '0 auto',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            {title: <Link to={`/gh/${orgName}`}>{orgName}</Link>},
            {title: <Link to={`/gh/${orgName}/${repoName}`}>{repoName}</Link>},
            {title: `Run ${shortUuid}...`},
          ]}
          style={{marginBottom: 16}}
        />

        {/* Header with title and stats */}
        <div style={{marginBottom: 24}}>
          <Typography.Title level={4} style={{marginBottom: 16}}>
            Analysis Run
          </Typography.Title>

          {runQuery.isLoading ? (
            <Space size="large" wrap>
              <Skeleton.Input active style={{width: 100, height: 60}} />
              <Skeleton.Input active style={{width: 100, height: 60}} />
              <Skeleton.Input active style={{width: 100, height: 60}} />
              <Skeleton.Input active style={{width: 120, height: 60}} />
            </Space>
          ) : run && (
            <Space size="large" wrap>
              <Statistic
                title="Total Projects"
                value={run.total_projects}
                prefix={<ProjectOutlined/>}
              />
              <Statistic
                title="Drifted"
                value={run.total_projects_drifted}
                valueStyle={{color: run.total_projects_drifted > 0 ? '#cf1322' : '#3f8600'}}
                prefix={<WarningOutlined/>}
              />
              <Statistic
                title="Duration"
                value={dayjs.duration({milliseconds: run.duration_millis}).asSeconds().toFixed(1)}
                suffix="s"
                prefix={<ClockCircleOutlined/>}
              />
              <Tooltip title={dayjs(run.created_at).format('lll')}>
                <Statistic
                  title="Run Date"
                  value={dayjs(run.created_at).fromNow()}
                />
              </Tooltip>
            </Space>
          )}
        </div>

        {/* Filters */}
        <Space orientation="vertical" style={{width: '100%', marginBottom: 16}} size="middle">
          <Space wrap>
            <Input
              placeholder="Filter by project path..."
              prefix={<SearchOutlined aria-hidden="true" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{width: 300}}
              aria-label="Filter projects by path"
            />
            <Segmented
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as StatusFilter)}
              options={[
                {label: `All (${counts.all})`, value: 'all'},
                {label: `Drifted (${counts.drifted})`, value: 'drifted'},
                {label: `Errored (${counts.errored})`, value: 'errored'},
                {label: `OK (${counts.ok})`, value: 'ok'},
              ]}
            />
          </Space>
          {searchText && (
            <Typography.Text type="secondary">
              Showing {filteredProjects.length} of {allProjects.length} projects
            </Typography.Text>
          )}
        </Space>

        {/* Error State */}
        {runQuery.isError && (
          <Alert
            title="Failed to load analysis run"
            description="We couldn't fetch the analysis run details. Please check your connection and try again."
            type="error"
            showIcon
            action={
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => runQuery.refetch()}
              >
                Retry
              </Button>
            }
            style={{marginBottom: 16}}
          />
        )}

        {/* Table */}
        {!runQuery.isError && (
          <Table
            dataSource={filteredProjects}
            columns={columns}
            loading={runQuery.isLoading}
            rowKey="id"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} projects`,
            }}
            onRow={(record) => ({
              onClick: () => openProjectDrawer(record),
              onKeyDown: (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openProjectDrawer(record);
                }
              },
              style: {cursor: 'pointer'},
              tabIndex: 0,
              role: 'button',
              'aria-label': `View output for ${record.dir}`,
            })}
            size="middle"
            locale={{
              emptyText: searchText || statusFilter !== 'all' ? (
                <Empty
                  image={<FilterOutlined style={{fontSize: 48, color: '#bfbfbf'}} />}
                  description={
                    <Space orientation="vertical" size="small">
                      <Typography.Text>No projects match your filters</Typography.Text>
                      <Typography.Text type="secondary">
                        Try adjusting your search or status filter
                      </Typography.Text>
                    </Space>
                  }
                >
                  <Button onClick={() => { setSearchText(''); setStatusFilter('all'); }}>
                    Clear Filters
                  </Button>
                </Empty>
              ) : (
                <Empty description="No projects in this analysis run" />
              )
            }}
          />
        )}

        {/* Output Drawer */}
        <Drawer
          title={
            selectedProject ? (
              <Space orientation="vertical" size="small" style={{width: '100%'}}>
                <Space>
                  {getProjectStatus(selectedProject).tag}
                  <Tag>{selectedProject.type}</Tag>
                </Space>
                <Typography.Text code style={{fontSize: '12px', wordBreak: 'break-all'}}>
                  {selectedProject.dir}
                </Typography.Text>
              </Space>
            ) : 'Project Output'
          }
          placement="right"
          width={Math.min(1000, window.innerWidth * 0.9)}
          onClose={closeDrawer}
          open={drawerOpen}
          extra={
            <Button
              icon={<CopyOutlined aria-hidden="true" />}
              onClick={() => copyToClipboard(selectedOutput)}
              aria-label="Copy output to clipboard"
            >
              Copy
            </Button>
          }
        >
          {selectedProject && (
            <div style={{height: '100%', overflow: 'auto'}}>
              <SyntaxHighlighter
                language="hcl"
                style={dracula}
                customStyle={{margin: 0, borderRadius: '8px', minHeight: '100%'}}
              >
                {selectedOutput}
              </SyntaxHighlighter>
            </div>
          )}
        </Drawer>
      </Card>
    </PageContainer>
  );
}

export default RunResultPage;
