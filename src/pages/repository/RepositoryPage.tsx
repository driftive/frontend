import {PageContainer} from "../../components/PageWrapper/PageWrapper.tsx";

import {Card, Tabs, Typography} from "antd";
import React from "react";
import {Link, useParams} from "react-router";

const {Title} = Typography;

const ResultListTab = () => {
  return (
    <div>
      <p>ResultListTab</p>
    </div>
  )
}

export const RepositoryPage: React.FC = () => {

  const params = useParams();
  const org = params.org;
  const repository =
    {
      name: "repo1",
      id: 1,
      is_private: false
    }
  ;

  return (
    <PageContainer>
      <Card style={{
        width: "60%",
        borderRadius: 8,
      }}
            bordered={false}>
        <Title level={3}><Link to={`/gh/${org}`}>{org}</Link> / {repository.name}</Title>
        <Tabs items={[
          {key: '1', label: 'Results', children: <ResultListTab/>},
          {key: '2', label: 'Configs', children: <p>Configs</p>}
        ]}>

        </Tabs>
      </Card>


    </PageContainer>
  );
}
