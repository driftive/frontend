import React from "react";
import {useQuery} from "react-query";
import useAxios from "../../context/auth/axios.ts";
import {isOk} from "../../utils/axios.ts";
import Button from "antd/es/button";
import {Flex, Layout, Typography} from "antd";
import MainOrgSelect from "../../components/MainOrgSelect/MainOrgSelect.tsx";

const {Text,} = Typography;
const {Content} = Layout;

interface OrganizationDTO {
  id: number;
  name: string;
}

export const OrganizationsPage: React.FC = () => {

    const axios = useAxios();
    const listOrgsQuery = useQuery({
      queryKey: 'listOrgs', queryFn: async () => {
        const response = await axios.get<OrganizationDTO[]>('/v1/gh/orgs');
        // ok
        if (!isOk(response)) {
          throw new Error('Network response was not ok');
        }
        return response.data;
      }
    })

    if (listOrgsQuery.isLoading) {
      return <div>Loading...</div>
    }

    return (
      <Layout style={{minHeight: '100vh', minWidth: '100vw'}}>
        <Content
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >

          <div style={{padding: 24, background: '#fff', borderRadius: 8, minWidth: '50vw'}}>
            <h1>Organizations</h1>
            <MainOrgSelect
              onChange={(value) => console.log(value)}
              options={listOrgsQuery.data!.map((org: OrganizationDTO) => ({
                value: org.id.toString(),
                label: org.name,
                installed: false,
                image: 'https://avatars.githubusercontent.com/u/172135914?s=200&v=4',
              }))}>
            </MainOrgSelect>

            {listOrgsQuery.isLoading && <div>Loading...</div>}
            {listOrgsQuery.isError && <div>Error: {listOrgsQuery.error.message}</div>}
            {/*{listOrgsQuery.isSuccess && <div>*/}
            {/*    <ul>*/}
            {/*      {listOrgsQuery.data.map((org: OrganizationDTO) => (*/}
            {/*        <li key={org.id}>{org.name}</li>*/}
            {/*      ))}*/}
            {/*    </ul>*/}
            {/*</div>}*/}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                justifySelf: 'center',
                padding: '8px'
              }}>
              <div style={{marginTop: '12px'}}>
                <Flex vertical>
                  <Text type="secondary">Missing organizations?</Text>
                  <Button>Re-sync</Button>
                </Flex>

              </div>
            </div>
          </div>

        </Content>
      </Layout>

      // <Row
      //   style={{minHeight: '100vh'}}
      //   justify="center"
      //   align="middle"
      // >
      //   <Col>
      //
      //   </Col>
      // </Row>
    )
  }
;
