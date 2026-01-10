import React from 'react';
import {Button, Card, Input, message, Modal, Skeleton, Space, Typography} from 'antd';
import {ExclamationCircleOutlined} from '@ant-design/icons';
import {GitRepository} from '../../../model/GitRepository.ts';
import {GitOrganization} from '../../../model/GitOrganization.ts';
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import useAxios from "../../../context/auth/axios.ts";
import {isOk} from "../../../utils/axios.ts";
import {useNavigate} from "react-router";

const {Title, Paragraph, Text} = Typography;

export interface RepoConfigTabProps {
  organization: GitOrganization;
  repository: GitRepository;
}

export const RepoConfigTab: React.FC<RepoConfigTabProps> = ({organization, repository}) => {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isEraseModalOpen, setIsEraseModalOpen] = React.useState(false);
  const [eraseConfirmText, setEraseConfirmText] = React.useState('');

  const {data: tokenResponse, isLoading: isTokenLoading} = useQuery({
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
      queryClient.invalidateQueries({queryKey: ["getRepoToken", repository]});
    }
  });

  const handleTokenAction = () => {
    regenerateToken.mutate();
  };

  const eraseRepository = useMutation({
    mutationKey: ["eraseRepository", repository],
    mutationFn: async () => {
      const response = await axios.delete(`/v1/repo/${repository.id}`);
      if (!isOk(response)) {
        throw new Error("Failed to erase repository");
      }
      return response.data;
    },
    onSuccess: () => {
      message.success('Repository data erased successfully');
      queryClient.invalidateQueries({queryKey: ["listOrgRepos"]});
      navigate(`/gh/${organization.name}`);
    },
    onError: () => {
      message.error('Failed to erase repository data');
    }
  });

  const handleEraseRepository = () => {
    if (eraseConfirmText === repository.name) {
      eraseRepository.mutate();
      setIsEraseModalOpen(false);
      setEraseConfirmText('');
    }
  };

  const handleEraseModalClose = () => {
    setIsEraseModalOpen(false);
    setEraseConfirmText('');
  };

  return (
    <div style={{paddingTop: 16}}>
      <Title level={4}>Repository Token</Title>
        <Text type="secondary">
          Use this token to send Driftive results. Keep it secret.
        </Text>
        <Card style={{marginTop: 16, borderRadius: 8}}>
          {isTokenLoading ? (
            <Skeleton active paragraph={{rows: 1}} />
          ) : tokenResponse && tokenResponse.token ? (
            <Paragraph copyable={{text: tokenResponse.token}} code>
              {tokenResponse.token}
            </Paragraph>
          ) : (
            <Paragraph>
              <Text type="secondary">No token found for this repository.</Text>
            </Paragraph>
          )}
          <Space style={{marginTop: 16}}>
            <Button
              type="primary"
              onClick={handleTokenAction}
              loading={regenerateToken.isPending}
              disabled={isTokenLoading}
            >
              {tokenResponse && tokenResponse.token ? 'Regenerate Token' : 'Create Token'}
            </Button>
          </Space>
        </Card>

        <Title level={4} style={{marginTop: 32, marginBottom: 16}}>
          Danger Zone
        </Title>
        <Card style={{borderColor: '#ff4d4f', borderRadius: 8}}>
          <Title level={5}>Erase Repository</Title>
          <Paragraph>
            This action permanently removes all data for this repository and cannot be undone.
          </Paragraph>
          <Button
            danger
            onClick={() => setIsEraseModalOpen(true)}
            loading={eraseRepository.isPending}
          >
            Erase Repository
          </Button>
        </Card>

        <Modal
          title={
            <Space>
              <ExclamationCircleOutlined style={{color: '#ff4d4f'}} />
              <span>Erase Repository Data</span>
            </Space>
          }
          open={isEraseModalOpen}
          onCancel={handleEraseModalClose}
          footer={[
            <Button key="cancel" onClick={handleEraseModalClose}>
              Cancel
            </Button>,
            <Button
              key="erase"
              danger
              type="primary"
              disabled={eraseConfirmText !== repository?.name}
              loading={eraseRepository.isPending}
              onClick={handleEraseRepository}
            >
              Erase Repository
            </Button>
          ]}
        >
          <Paragraph>
            This will permanently delete all analysis results, tokens, and configuration
            for <Text strong>{repository?.name}</Text>. This action cannot be undone.
          </Paragraph>
          <Paragraph>
            To confirm, type <Text code>{repository?.name}</Text> below:
          </Paragraph>
          <Input
            placeholder="Enter repository name to confirm"
            value={eraseConfirmText}
            onChange={(e) => setEraseConfirmText(e.target.value)}
            status={eraseConfirmText && eraseConfirmText !== repository?.name ? 'error' : undefined}
          />
        </Modal>
    </div>
  );
};
