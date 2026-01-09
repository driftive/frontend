import {PageContainer} from "../../components/PageWrapper/PageWrapper.tsx";

import {Alert, Breadcrumb, Button, Card, Empty, Flex, List, Skeleton, Spin, Tag, Typography} from "antd";
import React from "react";
import {GlobalOutlined, HomeOutlined, LockOutlined, ReloadOutlined, RightOutlined} from "@ant-design/icons";
import {useNavigate, useParams} from "react-router";
import {useQuery} from "react-query";
import {isOk} from "../../utils/axios.ts";
import useAxios from "../../context/auth/axios.ts";

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
      <Card style={{
        width: "65%",
        maxWidth: 1024,
        borderRadius: 8,
      }}
            bordered={false}>
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
        <Title level={3}>{orgName}'s Repositories</Title>

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
            description={
              <Text type="secondary">
                No repositories found in this organization
              </Text>
            }
            style={{padding: '32px 0'}}
          />
        ) : (
          <List
            itemLayout="horizontal"
            size={"small"}
            dataSource={listReposQuery.data}
            renderItem={(item) => (
              <List.Item onClick={() => {
                navigate(`/gh/${orgName}/${item.name}`)
              }}
                         style={{cursor: "pointer"}}>
                <List.Item.Meta
                  avatar={item.is_private ? <LockOutlined/> : <GlobalOutlined/>}
                  title={<Flex justify={"space-between"}>
                    <Flex gap="0 8px"><p>{item.name}</p>{item.is_private ? (
                      <Tag color="default">Private</Tag>) : (<></>)}
                    </Flex>
                    <RightOutlined/>
                  </Flex>}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </PageContainer>
  );
}
