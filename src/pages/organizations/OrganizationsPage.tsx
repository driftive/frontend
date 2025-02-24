import React from "react";
import {useQuery} from "react-query";
import {Button, Card, Modal, Space, Typography} from "antd";
import useAxios from "../../context/auth/axios.ts";
import {isOk} from "../../utils/axios.ts";
import MainOrgSelect from "../../components/MainOrgSelect/MainOrgSelect.tsx";
import {PageContainer} from "../../components/PageWrapper/PageWrapper.tsx";
import {useNavigate} from "react-router";

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
  const showGithubSyncModal = () => setIsGithubSyncModalOpen(true);
  const handleGithubSync = () => {
    setIsGithubSyncModalOpen(false);
    console.log("Syncing with Github...");
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
          <div>Loading...</div>
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

        <MainOrgSelect
          onChange={async (value) => {
            if (!value) {
              return;
            }
            if (value.installed) {
              axios.get(`/v1/gh/orgs/sync?org_id=${value.value}`)
              navigate(`/gh/${value.label}`)
            } else {
              // console.log(`Installing organization ${value.label}...`);
              // window.location.href = `https://github.com/apps/<app_name>/installations/new`
              axios.get(`/v1/gh/orgs/install?org_id=${value.value}`)
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

        {listOrgsQuery.isLoading && <div>Loading...</div>}
        {listOrgsQuery.isError && (
          <div>Error: {(listOrgsQuery.error as Error).message}</div>
        )}

        <Space direction="vertical" style={{marginTop: 24}}>
          <Text type="secondary">Missing organizations?</Text>
          <Button type="primary" onClick={() => {
            showGithubSyncModal();
          }}>Re-sync</Button>
          <Modal title={"Github Sync"} open={isGithubSyncModalOpen} onOk={handleGithubSync}>
            <p>This will trigger a sync with Github to fetch organizations and repositories.</p>
            <p>Are you sure you want to proceed?</p>
          </Modal>
        </Space>
      </Card>
    </PageContainer>
  );
};
