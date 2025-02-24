import React from "react";
import {GitRepository} from "../../../model/GitRepository.ts";
import {GitOrganization} from "../../../model/GitOrganization.ts";
import {Card, Divider, Flex, Layout, Typography} from "antd";
import Button from "antd/es/button";

const {Content} = Layout;
const {Paragraph, Title} = Typography;

export interface RepoConfigTabProps {
  organization: GitOrganization;
  repository: GitRepository;
}

export const RepoConfigTab: React.FC<RepoConfigTabProps> = () => {

  const repoToken = "test_123123"

  return (
    <Layout>
      <Content>
        <Divider orientation="left">Token</Divider>
        <Card>
          {/*<Title level={4}>Token</Title>*/}
          <Paragraph copyable={{text: repoToken}} code>
            {repoToken}
          </Paragraph>
        </Card>

        <Divider orientation="left" style={{marginTop: 16}}>Danger zone</Divider>
        <Card>
          <Flex vertical>
            <Flex justify={"space-between"}>
              <Flex vertical>
                <Title level={5}>Erase repository</Title>
                <Paragraph>
                  This action will erase all data associated with this repository. This action is irreversible.
                </Paragraph>
              </Flex>
              <Flex>
                <Button danger>Erase Repository</Button>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      </Content>
    </Layout>
  )
}
