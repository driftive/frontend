import {PageContainer} from "../../components/PageWrapper/PageWrapper.tsx";

import {Card, Flex, List, Tag, Typography} from "antd";
import React from "react";
import {CaretLeftOutlined, GlobalOutlined, LockOutlined, RightOutlined} from "@ant-design/icons";
import {Link, useNavigate, useParams} from "react-router";

const {Title} = Typography;

interface RepositoryDTO {
  id: number;
  name: string;
  // full_name: string;
  is_private: boolean;
}

export const RepositoriesPage: React.FC = () => {

  const navigate = useNavigate();
  const params = useParams();
  const org = params.org;

  const repositories: RepositoryDTO[] = [
    {
      name: "repo1",
      id: 1,
      is_private: false
    },
    {
      name: "repo2",
      id: 2,
      is_private: true
    },
    {
      name: "repo3",
      id: 3,
      is_private: false
    }
  ]

  return (
    <PageContainer>
      <Card style={{
        width: "65%",
        maxWidth: 1024,
        borderRadius: 8,
      }}
            bordered={false}>
        <Title level={3}><Link to={`/gh/orgs`}><CaretLeftOutlined /></Link> {org}'s Repositories</Title>
        {/*<Title level={2}>Repositories</Title>*/}
        <List
          itemLayout="horizontal"
          size={"small"}
          dataSource={repositories}
          renderItem={(item) => (
            <List.Item onClick={() => {
              navigate(`/gh/${org}/${item.name}`)
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
      </Card>


    </PageContainer>
  );
}
