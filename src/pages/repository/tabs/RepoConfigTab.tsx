import React from 'react';
import {Button, Card, Layout, Space, Typography} from 'antd';
import {GitRepository} from '../../../model/GitRepository.ts';
import {GitOrganization} from '../../../model/GitOrganization.ts';
import {useMutation, useQuery, useQueryClient} from "react-query";
import useAxios from "../../../context/auth/axios.ts";
import {isOk} from "../../../utils/axios.ts";

const {Content} = Layout;
const {Title, Paragraph, Text} = Typography;

export interface RepoConfigTabProps {
  organization: GitOrganization;
  repository: GitRepository;
}

export const RepoConfigTab: React.FC<RepoConfigTabProps> = ({repository}) => {
  const axios = useAxios();
  const queryClient = useQueryClient();

  const {data: tokenResponse} = useQuery({
    queryKey: ["getRepoToken", repository],
    enabled: (!!repository) && (repository.id !== undefined && repository.id !== null),
    queryFn: async () => {
      const response = await axios.get(`/v1/repo/${repository.id}/token`);
      if (!isOk(response)) {
        throw new Error("Network response was not ok");
      }
      return response.data;
    },
  });

  const regenerateToken = useMutation({
    mutationKey: ["regenerateRepoToken", repository],
    mutationFn: async () => {
      const response = await axios.post(`/v1/repo/${repository.id}/token`);
      if (!isOk(response)) {
        throw new Error("Network response was not ok");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["getRepoToken", repository]);
    }
  });

  const handleTokenAction = () => {
    regenerateToken.mutate();
  };

  return (
    <Layout style={{backgroundColor: '#fff'}}>
      <Content style={{padding: 24}}>
        <Title level={4}>Repository Token</Title>
        <Text type="secondary">
          Use this token to send Driftive results. Keep it secret.
        </Text>
        <Card style={{marginTop: 16}}>
          {tokenResponse && tokenResponse.token ? (
            <Paragraph copyable={{text: tokenResponse.token}} code>
              {tokenResponse.token}
            </Paragraph>
          ) : (
            <Paragraph>
              <Text type="secondary">No token found for this repository.</Text>
            </Paragraph>
          )}
          <Space style={{marginTop: 16}}>
            <Button type="primary" onClick={handleTokenAction}>
              {tokenResponse && tokenResponse.token ? 'Regenerate Token' : 'Create Token'}
            </Button>
          </Space>
        </Card>

        <Title level={4} style={{marginTop: 32, marginBottom: 16}}>
          Danger Zone
        </Title>
        <Card>
          <Title level={5}>Erase Repository</Title>
          <Paragraph>
            This action permanently removes all data for this repository and cannot be undone.
          </Paragraph>
          <Button danger>Erase Repository</Button>
        </Card>
      </Content>
    </Layout>
  );
};
