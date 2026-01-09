import React from "react";
import {useQuery} from "react-query";
import {Alert, Button, Card, Divider, Empty, Modal, Skeleton, Space, Spin, Tooltip, Typography} from "antd";
import useAxios from "../../context/auth/axios.ts";
import {isOk} from "../../utils/axios.ts";
import MainOrgSelect from "../../components/MainOrgSelect/MainOrgSelect.tsx";
import {PageContainer} from "../../components/PageWrapper/PageWrapper.tsx";
import {useNavigate} from "react-router";
import {GITHUB_INSTALLATION_URL} from "../../configs.ts";
import {QuestionCircleFilled, ReloadOutlined, SyncOutlined} from "@ant-design/icons";

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
          style={{
            width: "65%",
            maxWidth: 1024,
            borderRadius: 8,
          }}
          bordered={false}
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
        style={{
          width: "65%",
          maxWidth: 1024,
          borderRadius: 8,
        }}
        bordered={false}
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
            description={
              <Space orientation="vertical" size="small">
                <Text>No organizations found</Text>
                <Text type="secondary">
                  Install the GitHub App in your organizations to get started
                </Text>
              </Space>
            }
            style={{padding: '32px 0'}}
          >
            <Button
              type="primary"
              onClick={() => window.open(GITHUB_INSTALLATION_URL, '_blank')}
            >
              Install GitHub App
            </Button>
          </Empty>
        ) : (
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
        )}

        <Space orientation="vertical" style={{marginTop: 24}}>
          <Text type="secondary">Missing organizations?</Text>
          <Button
            type="primary"
            loading={isSyncing}
            icon={isSyncing ? <SyncOutlined spin /> : undefined}
            onClick={() => {
              showGithubSyncModal();
            }}
          >
            {isSyncing ? 'Syncing...' : 'Re-sync'}
          </Button>
          <Modal title={"Github Sync"} open={isGithubSyncModalOpen} onOk={handleGithubSync}
                 onCancel={() => setIsGithubSyncModalOpen(false)}>
            <p>This will trigger a sync with Github to fetch organizations and repositories.</p>
            <p>Are you sure you want to proceed?</p>
          </Modal>
        </Space>

        <Divider style={{margin: "24px 0"}}/>

        <Space orientation="vertical">
          <Space><Text type="secondary">Need to install our GitHub app in an organization?</Text> <Tooltip
            title={
              <Text type={"warning"}>
                Organizations won't appear until you've installed our GitHub app
              </Text>
            }
          ><QuestionCircleFilled/>
          </Tooltip>
          </Space>
          <Button
            type="default"
            onClick={() => window.open(GITHUB_INSTALLATION_URL, '_blank')}
          >
            Install GitHub App
          </Button>
        </Space>
      </Card>
    </PageContainer>
  );
};
