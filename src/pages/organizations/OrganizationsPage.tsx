import React from "react";
import { useQuery } from "react-query";
import { Layout, Typography, Button, Card, Space } from "antd";
import useAxios from "../../context/auth/axios.ts";
import { isOk } from "../../utils/axios.ts";
import MainOrgSelect from "../../components/MainOrgSelect/MainOrgSelect.tsx";

const { Text, Title } = Typography;
const { Content } = Layout;

interface OrganizationDTO {
  id: number;
  name: string;
}

export const OrganizationsPage: React.FC = () => {
  const axios = useAxios();

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
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
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
          <Title level={2} style={{ marginBottom: 24 }}>
            Organizations
          </Title>

          <MainOrgSelect
            onChange={(value) => console.log(value)}
            options={
              listOrgsQuery.data?.map((org) => ({
              value: org.id.toString(),
              label: org.name,
              installed: false,
                image:
                  "https://avatars.githubusercontent.com/u/172135914?s=200&v=4",
              })) || []
            }
          />

          {listOrgsQuery.isLoading && <div>Loading...</div>}
          {listOrgsQuery.isError && (
            <div>Error: {(listOrgsQuery.error as Error).message}</div>
          )}

          <Space direction="vertical" style={{ marginTop: 24 }}>
            <Text type="secondary">Missing organizations?</Text>
            <Button type="primary">Re-sync</Button>
          </Space>
        </Card>
      </Content>
    </Layout>
  );
};
