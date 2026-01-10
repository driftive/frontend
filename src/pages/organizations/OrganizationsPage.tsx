import React from "react";
import {useQuery} from "react-query";
import {Alert, Button, Card, Empty, Flex, Modal, Skeleton, Space, Spin, Typography} from "antd";
import useAxios from "../../context/auth/axios.ts";
import {isOk} from "../../utils/axios.ts";
import MainOrgSelect from "../../components/MainOrgSelect/MainOrgSelect.tsx";
import {PageContainer} from "../../components/PageWrapper/PageWrapper.tsx";
import {useNavigate} from "react-router";
import {GITHUB_INSTALLATION_URL} from "../../configs.ts";
import {GithubOutlined, ReloadOutlined, SyncOutlined} from "@ant-design/icons";

const {Text, Title} = Typography;

interface OrganizationDTO {
  id: number;
  name: string;
  installed: boolean;
  avatar_url: string;
}

export const OrganizationsPage: React.FC = () => {
  const axios = useAxios();
  const navigate = useNavigate();

  const [isGithubSyncModalOpen, setIsGithubSyncModalOpen] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const showGithubSyncModal = () => setIsGithubSyncModalOpen(true);
  const handleGithubSync = async () => {
    setIsGithubSyncModalOpen(false);
    setIsSyncing(true);
    try {
      await axios.post("/v1/sync_user");
      await listOrgsQuery.refetch();
    } finally {
      setIsSyncing(false);
    }
  }

  const listOrgsQuery = useQuery({
    queryKey: "listOrgs",
    queryFn: async () => {
      const response = await axios.get<OrganizationDTO[]>("/v1/gh/orgs");
      if (!isOk(response)) {
        throw new Error("Network response was not ok");
      }
      return response.data;
    },
  });

  if (listOrgsQuery.isLoading) {
    return (
      <PageContainer>
        <Card
          style={{borderRadius: 12}}
          styles={{body: {padding: 32}}}
        >
          <Title level={3} style={{marginBottom: 24}}>
            Organizations
          </Title>
          <Spin tip="Loading organizations...">
            <div style={{padding: '24px 0'}}>
              <Skeleton.Input active style={{width: '100%', height: 38}} block />
              <Skeleton active paragraph={{rows: 2}} style={{marginTop: 24}} />
            </div>
          </Spin>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card
        style={{borderRadius: 12}}
        styles={{body: {padding: 32}}}
      >
        <Title level={3} style={{marginBottom: 24}}>
          Organizations
        </Title>

        {listOrgsQuery.isError ? (
          <Alert
            title="Failed to load organizations"
            description="We couldn't fetch your organizations. Please check your connection and try again."
            type="error"
            showIcon
            action={
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => listOrgsQuery.refetch()}
              >
                Retry
              </Button>
            }
            style={{marginBottom: 24}}
          />
        ) : listOrgsQuery.data?.length === 0 ? (
          <Empty
            image={<GithubOutlined style={{fontSize: 48, color: '#bfbfbf'}} />}
            description={
              <Space orientation="vertical" size="small">
                <Text>No organizations found</Text>
                <Text type="secondary">
                  Install the GitHub App in your organizations to get started
                </Text>
              </Space>
            }
            style={{padding: '48px 0'}}
          >
            <Space>
              <Button
                type="primary"
                icon={<GithubOutlined />}
                onClick={() => window.open(GITHUB_INSTALLATION_URL, '_blank')}
              >
                Install GitHub App
              </Button>
              <Button
                loading={isSyncing}
                icon={<SyncOutlined spin={isSyncing} />}
                onClick={showGithubSyncModal}
              >
                Re-sync
              </Button>
            </Space>
          </Empty>
        ) : (
          <>
            <MainOrgSelect
              onChange={async (value) => {
                if (!value) {
                  return;
                }
                if (value.installed) {
                  navigate(`/gh/${value.label}`)
                }
              }}
              options={
                listOrgsQuery.data?.map((org) => ({
                  value: org.id.toString(),
                  label: org.name,
                  installed: org.installed,
                  image: org.avatar_url || '',
                })) || []
              }
            />

            {/* Action buttons */}
            <Flex
              justify="space-between"
              align="center"
              style={{
                marginTop: 24,
                paddingTop: 24,
                borderTop: '1px solid #f0f0f0'
              }}
            >
              <Text type="secondary" style={{fontSize: 13}}>
                Missing an organization? Try syncing or install the GitHub App.
              </Text>
              <Space>
                <Button
                  size="small"
                  icon={<SyncOutlined spin={isSyncing} />}
                  loading={isSyncing}
                  onClick={showGithubSyncModal}
                >
                  Re-sync
                </Button>
                <Button
                  size="small"
                  icon={<GithubOutlined />}
                  onClick={() => window.open(GITHUB_INSTALLATION_URL, '_blank')}
                >
                  Install App
                </Button>
              </Space>
            </Flex>
          </>
        )}

        <Modal
          title="Sync with GitHub"
          open={isGithubSyncModalOpen}
          onOk={handleGithubSync}
          onCancel={() => setIsGithubSyncModalOpen(false)}
          okText="Sync Now"
        >
          <Text>
            This will fetch the latest organizations and repositories from GitHub.
          </Text>
        </Modal>
      </Card>
    </PageContainer>
  );
};
