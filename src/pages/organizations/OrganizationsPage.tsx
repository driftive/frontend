import React from "react";
import {useQuery} from "react-query";
import {Layout, Typography, Button, Card, Space, Modal} from "antd";
import useAxios from "../../context/auth/axios.ts";
import {isOk} from "../../utils/axios.ts";
import MainOrgSelect from "../../components/MainOrgSelect/MainOrgSelect.tsx";

const {Text, Title} = Typography;
const {Content} = Layout;

interface OrganizationDTO {
  id: number;
  name: string;
  installed: boolean;
  avatar_url: string;
}

export const OrganizationsPage: React.FC = () => {
  const axios = useAxios();

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
    return <div>Loading...</div>;
  }

  return (
    <Layout style={{minHeight: "100vh", backgroundColor: "#f0f2f5"}}>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingTop: 128,
        }}
      >
        <Card
          style={{
            width: "50%",
            maxWidth: 600,
            borderRadius: 8,
          }}
          bordered={false}
        >
          <Title level={2} style={{marginBottom: 24}}>
            Organizations
          </Title>

          <MainOrgSelect
            onChange={async (value) => {
              if (!value) {
                return;
              }
              if (value.installed) {
                console.log(`Organization ${value.label} is already installed`);
              } else {
                console.log(`Installing organization ${value.label}...`);
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
      </Content>
    </Layout>
  );
};
