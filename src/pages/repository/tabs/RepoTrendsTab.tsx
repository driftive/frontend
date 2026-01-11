import React from "react";
import {Alert, Button, Card, Col, Empty, Row, Select, Space, Spin, Statistic, Table, TableProps, Tooltip, Typography} from "antd";
import {
  BarChartOutlined,
  ClockCircleOutlined,
  FireOutlined,
  FolderOutlined,
  LineChartOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {useQuery} from "@tanstack/react-query";
import useAxios from "../../../context/auth/axios.ts";
import {isOk} from "../../../utils/axios.ts";
import {colors} from "../../../theme/theme.ts";
import {GitRepository} from "../../../model/GitRepository.ts";
import {GitOrganization} from "../../../model/GitOrganization.ts";
import {RepositoryTrends, FrequentlyDriftedProject} from "../../../model/Trends.ts";
import {dayjs} from "../../../utils/dayjs.ts";

export interface RepoTrendsTabProps {
  organization: GitOrganization;
  repository: GitRepository;
}

export const RepoTrendsTab: React.FC<RepoTrendsTabProps> = ({repository}) => {
  const axios = useAxios();
  const [daysBack, setDaysBack] = React.useState<number>(30);

  const trendsQuery = useQuery({
    queryKey: ["getRepoTrends", repository?.id, daysBack],
    enabled: !!repository && repository.id !== undefined,
    queryFn: async () => {
      const response = await axios.get<RepositoryTrends>(
        `/v1/repo/${repository.id}/trends?days_back=${daysBack}`
      );
      if (!isOk(response)) {
        throw new Error("Failed to fetch trends");
      }
      return response.data;
    },
  });

  const trends = trendsQuery.data;

  const frequentlyDriftedColumns: TableProps<FrequentlyDriftedProject>['columns'] = [
    {
      key: "dir",
      title: "Project",
      dataIndex: "dir",
      ellipsis: true,
      render: (dir: string) => (
        <Tooltip title={dir} placement="topLeft">
          <Space>
            <FolderOutlined style={{color: colors.primary}}/>
            <span style={{fontSize: 12}}>{dir}</span>
          </Space>
        </Tooltip>
      ),
    },
    {
      key: "type",
      title: "Type",
      dataIndex: "type",
      width: 60,
      align: "center",
      render: (type: string) => {
        const abbrev = type === "TERRAFORM" ? "TF" : type === "TERRAGRUNT" ? "TG" : type === "TOFU" ? "OT" : type;
        const full = type === "TOFU" ? "OpenTofu" : type.charAt(0) + type.slice(1).toLowerCase();
        return (
          <Tooltip title={full}>
            <Typography.Text type="secondary" style={{fontSize: 12}}>{abbrev}</Typography.Text>
          </Tooltip>
        );
      },
    },
    {
      key: "drift_count",
      title: "Drifts",
      dataIndex: "drift_count",
      width: 100,
      align: "right",
      render: (_: number, record: FrequentlyDriftedProject) => (
        <Tooltip title={`Drifted ${record.drift_count} times out of ${record.total_appearances} runs (${record.drift_percentage.toFixed(0)}%)`}>
          <span>
            <Typography.Text style={{color: colors.error, fontWeight: 500}}>
              {record.drift_count}
            </Typography.Text>
            <Typography.Text type="secondary" style={{fontSize: 12}}> ({record.drift_percentage.toFixed(0)}%)</Typography.Text>
          </span>
        </Tooltip>
      ),
    },
  ];

  if (trendsQuery.isLoading) {
    return (
      <div style={{paddingTop: 48, textAlign: "center"}}>
        <Spin tip="Loading trends..."/>
      </div>
    );
  }

  if (trendsQuery.isError) {
    return (
      <div style={{paddingTop: 16}}>
        <Alert
          type="error"
          message="Failed to load trends"
          description="Could not fetch trend analytics. Please try again."
          showIcon
          action={
            <Button size="small" icon={<ReloadOutlined/>} onClick={() => trendsQuery.refetch()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!trends || trends.summary.total_runs === 0) {
    return (
      <div style={{paddingTop: 16}}>
        <Empty
          description={
            <Space direction="vertical" size="small">
              <Typography.Text>No trend data available</Typography.Text>
              <Typography.Text type="secondary">
                Run more drift analyses to see trends over time
              </Typography.Text>
            </Space>
          }
          style={{padding: "48px 0"}}
        />
      </div>
    );
  }

  // Calculate average resolution time
  const avgResolutionTime = trends.resolution_times.length > 0
    ? trends.resolution_times.reduce((sum, r) => sum + r.avg_hours_to_resolve, 0) / trends.resolution_times.length
    : null;

  return (
    <div style={{paddingTop: 16}}>
      {/* Time Range Selector */}
      <Row justify="end" style={{marginBottom: 16}}>
        <Select
          value={daysBack}
          onChange={setDaysBack}
          options={[
            {value: 7, label: "Last 7 days"},
            {value: 30, label: "Last 30 days"},
            {value: 60, label: "Last 60 days"},
            {value: 90, label: "Last 90 days"},
          ]}
          style={{width: 150}}
        />
      </Row>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{marginBottom: 24}}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{borderRadius: 8, height: "100%"}}>
            <Statistic
              title={<span style={{fontSize: 12, color: colors.textSecondary}}>Drift Rate</span>}
              value={trends.summary.drift_rate_percent.toFixed(1)}
              suffix="%"
              valueStyle={{
                color: trends.summary.drift_rate_percent > 50 ? colors.error : colors.success,
              }}
              prefix={<LineChartOutlined/>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{borderRadius: 8, height: "100%"}}>
            <Statistic
              title={<span style={{fontSize: 12, color: colors.textSecondary}}>Runs with Drift</span>}
              value={trends.summary.runs_with_drift}
              suffix={`/ ${trends.summary.total_runs}`}
              valueStyle={{color: trends.summary.runs_with_drift > 0 ? colors.warning : colors.success}}
              prefix={<BarChartOutlined/>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            size="small"
            style={{
              borderRadius: 8,
              height: "100%",
              borderColor: trends.drift_free_streak.streak_count > 0 ? colors.success : undefined,
              backgroundColor: trends.drift_free_streak.streak_count > 0 ? colors.successBg : undefined,
            }}
          >
            <Statistic
              title={<span style={{fontSize: 12, color: colors.textSecondary}}>Drift-Free Streak</span>}
              value={trends.drift_free_streak.streak_count}
              suffix="runs"
              valueStyle={{color: colors.success}}
              prefix={<FireOutlined/>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{borderRadius: 8, height: "100%"}}>
            <Statistic
              title={<span style={{fontSize: 12, color: colors.textSecondary}}>Avg Resolution Time</span>}
              value={avgResolutionTime !== null ? avgResolutionTime.toFixed(1) : "N/A"}
              suffix={avgResolutionTime !== null ? "hours" : ""}
              prefix={<ClockCircleOutlined style={{color: colors.primary}}/>}
            />
          </Card>
        </Col>
      </Row>

      {/* Drift Rate Over Time Chart */}
      <Card
        title={
          <Space>
            <LineChartOutlined style={{color: colors.primary}}/>
            <span>Drift Rate Over Time</span>
          </Space>
        }
        size="small"
        style={{borderRadius: 12, marginBottom: 16}}
      >
        {trends.drift_rate_over_time.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trends.drift_rate_over_time}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border}/>
              <XAxis
                dataKey="date"
                tick={{fontSize: 11}}
                tickFormatter={(date) => dayjs(date).format("MM/DD")}
              />
              <YAxis
                tick={{fontSize: 11}}
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <RechartsTooltip
                labelFormatter={(date) => dayjs(date).format("MMM D, YYYY")}
                formatter={(value, name) => {
                  if (name === "drift_rate_percent" && typeof value === "number") {
                    return [`${value.toFixed(1)}%`, "Drift Rate"];
                  }
                  return [value, name];
                }}
              />
              <Area
                type="monotone"
                dataKey="drift_rate_percent"
                stroke={colors.error}
                fill={colors.errorBg}
                strokeWidth={2}
                name="drift_rate_percent"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="No data for selected time range"/>
        )}
      </Card>

      <Row gutter={[16, 16]}>
        {/* Frequently Drifted Projects */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FireOutlined style={{color: colors.error}}/>
                <span>Most Frequently Drifted Projects</span>
              </Space>
            }
            size="small"
            style={{borderRadius: 12}}
          >
            {trends.frequently_drifted_projects.length > 0 ? (
              <Table
                size="small"
                dataSource={trends.frequently_drifted_projects}
                columns={frequentlyDriftedColumns}
                rowKey="dir"
                pagination={false}
              />
            ) : (
              <Empty description="No frequently drifted projects"/>
            )}
          </Card>
        </Col>

        {/* Resolution Time Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{color: colors.primary}}/>
                <span>Mean Time to Resolution</span>
              </Space>
            }
            size="small"
            style={{borderRadius: 12}}
          >
            {trends.resolution_times.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trends.resolution_times}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border}/>
                  <XAxis
                    dataKey="date"
                    tick={{fontSize: 11}}
                    tickFormatter={(date) => dayjs(date).format("MM/DD")}
                  />
                  <YAxis tick={{fontSize: 11}} tickFormatter={(val) => `${val}h`}/>
                  <RechartsTooltip
                    labelFormatter={(date) => dayjs(date).format("MMM D, YYYY")}
                    formatter={(value) => {
                      if (typeof value === "number") {
                        return [`${value.toFixed(1)} hours`, "Avg Resolution Time"];
                      }
                      return [value, "Avg Resolution Time"];
                    }}
                  />
                  <Bar dataKey="avg_hours_to_resolve" fill={colors.primary} radius={[4, 4, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No resolution data available"/>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
