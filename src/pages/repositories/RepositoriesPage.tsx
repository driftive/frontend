import {PageContainer} from "../../components/PageWrapper/PageWrapper.tsx";

import {Card, Flex, List, Tag, Typography} from "antd";
import React from "react";
import {CaretLeftOutlined, GlobalOutlined, LockOutlined, RightOutlined} from "@ant-design/icons";
import {Link, useNavigate, useParams} from "react-router";
import {useQuery} from "react-query";
import {isOk} from "../../utils/axios.ts";
import useAxios from "../../context/auth/axios.ts";

const {Title} = Typography;

interface RepositoryDTO {
  id: number;
  name: string;
  is_private: boolean;
}

export const RepositoriesPage: React.FC = () => {

  const axios = useAxios();
  const navigate = useNavigate();
  const {org: orgName} = useParams();

  const {data: organization} = useQuery({
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
    enabled: (!!organization) && (organization.id !== undefined),
    queryFn: async () => {
      const response = await axios.get<RepositoryDTO[]>(`/v1/org/${organization.id}/repos`);
      if (!isOk(response)) {
        throw new Error("Network response was not ok");
      }
      return response.data;
    },
  });

  return (
    <PageContainer>
      <Card style={{
        width: "65%",
        maxWidth: 1024,
        borderRadius: 8,
      }}
            bordered={false}>
        <Title level={3}><Link to={`/gh/orgs`}><CaretLeftOutlined/></Link> {orgName}'s Repositories</Title>
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
      </Card>


    </PageContainer>
  );
}
