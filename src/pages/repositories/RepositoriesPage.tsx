import {PageContainer} from "../../components/PageWrapper/PageWrapper.tsx";

import {Alert, Breadcrumb, Button, Card, Empty, Flex, List, Skeleton, Space, Spin, Tag, Typography} from "antd";
import React from "react";
import {FolderOutlined, GlobalOutlined, HomeOutlined, LockOutlined, ReloadOutlined, RightOutlined} from "@ant-design/icons";
import {useNavigate, useParams} from "react-router";
import {useQuery} from "react-query";
import {isOk} from "../../utils/axios.ts";
import useAxios from "../../context/auth/axios.ts";
import {colors} from "../../theme/theme.ts";

const {Title, Text} = Typography;

interface RepositoryDTO {
  id: number;
  name: string;
  is_private: boolean;
}

export const RepositoriesPage: React.FC = () => {

  const axios = useAxios();
  const navigate = useNavigate();
  const {org: orgName} = useParams();

  const orgQuery = useQuery({
    queryKey: ["getOrgByName", orgName],
    enabled: !!orgName,
    queryFn: async () => {
      const response = await axios.get(`/v1/gh/org?org_name=${orgName}`);
      if (!isOk(response)) {
        throw new Error("Network response was not ok");
      }
      return response.data;
    },
  });

  const listReposQuery = useQuery({
    queryKey: "listOrgRepos",
    enabled: (!!orgQuery.data) && (orgQuery.data.id !== undefined),
    queryFn: async () => {
      const response = await axios.get<RepositoryDTO[]>(`/v1/org/${orgQuery.data.id}/repos`);
      if (!isOk(response)) {
        throw new Error("Network response was not ok");
      }
      return response.data;
    },
  });

  const isLoading = orgQuery.isLoading || listReposQuery.isLoading;
  const isError = orgQuery.isError || listReposQuery.isError;
  const isEmpty = !isLoading && !isError && listReposQuery.data?.length === 0;

  const handleRetry = () => {
    if (orgQuery.isError) {
      orgQuery.refetch();
    } else {
      listReposQuery.refetch();
    }
  };

  return (
    <PageContainer>
      <Card
        style={{borderRadius: 12}}
        styles={{body: {padding: 32}}}
      >
        <Breadcrumb
          items={[
            {
              href: '/gh/orgs',
              title: <><HomeOutlined /> Organizations</>,
            },
            {
              title: orgName,
            },
          ]}
          style={{marginBottom: 16}}
        />
        <Flex justify="space-between" align="center" style={{marginBottom: 8}}>
          <Title level={3} style={{margin: 0}}>{orgName}</Title>
          {listReposQuery.data && listReposQuery.data.length > 0 && (
            <Text type="secondary">
              {listReposQuery.data.length} {listReposQuery.data.length === 1 ? 'repository' : 'repositories'}
            </Text>
          )}
        </Flex>

        {isLoading ? (
          <Spin tip="Loading repositories...">
            <div style={{padding: '16px 0'}}>
              <Skeleton active avatar paragraph={{rows: 1}} />
              <Skeleton active avatar paragraph={{rows: 1}} />
              <Skeleton active avatar paragraph={{rows: 1}} />
            </div>
          </Spin>
        ) : isError ? (
          <Alert
            title="Failed to load repositories"
            description="We couldn't fetch the repositories for this organization. Please check your connection and try again."
            type="error"
            showIcon
            action={
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleRetry}
              >
                Retry
              </Button>
            }
          />
        ) : isEmpty ? (
          <Empty
            image={<FolderOutlined style={{fontSize: 48, color: '#bfbfbf'}} />}
            description={
              <Space orientation="vertical" size="small">
                <Text>No repositories found</Text>
                <Text type="secondary">
                  This organization doesn't have any repositories yet
                </Text>
              </Space>
            }
            style={{padding: '48px 0'}}
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={listReposQuery.data}
            aria-label="Repository list"
            style={{marginTop: 16}}
            renderItem={(item) => (
              <List.Item
                className="hoverable-list-item"
                onClick={() => {
                  navigate(`/gh/${orgName}/${item.name}`)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/gh/${orgName}/${item.name}`)
                  }
                }}
                style={{cursor: "pointer", padding: '14px 16px', borderRadius: 8}}
                tabIndex={0}
                role="button"
                aria-label={`Open repository ${item.name}${item.is_private ? ' (private)' : ''}`}
              >
                <Flex justify="space-between" align="center" style={{width: '100%'}}>
                  <Space size={12}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: item.is_private ? '#f5f5f5' : colors.primaryLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.is_private ? (
                        <LockOutlined style={{color: colors.textSecondary}} aria-hidden="true" />
                      ) : (
                        <GlobalOutlined style={{color: colors.primary}} aria-hidden="true" />
                      )}
                    </div>
                    <div>
                      <Text strong>{item.name}</Text>
                      {item.is_private && (
                        <Tag color="default" style={{marginLeft: 8, fontSize: 11}}>Private</Tag>
                      )}
                    </div>
                  </Space>
                  <RightOutlined style={{color: colors.textSecondary}} aria-hidden="true" />
                </Flex>
              </List.Item>
            )}
          />
        )}
      </Card>
    </PageContainer>
  );
}
