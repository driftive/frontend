import {PageContainer} from "../../components/PageWrapper/PageWrapper.tsx";

import {Card, Skeleton, Spin, Tabs, Typography} from "antd";
import React from "react";
import {Link, useNavigate, useParams, useSearchParams} from "react-router";
import {useQuery} from "react-query";
import {isOk} from "../../utils/axios.ts";
import useAxios from "../../context/auth/axios.ts";
import {RepoConfigTab} from "./tabs/RepoConfigTab.tsx";
import {RepoResultsTab} from "./tabs/RepoResultsTab.tsx";

enum RepoPageTabs {
  RESULTS = 'results',
  CONFIGS = 'configs',
}

export const RepositoryPage: React.FC = () => {

  const axios = useAxios();
  const {org: orgName, repo: repoName} = useParams();
  const [searchParams] = useSearchParams();

  const queryTab = searchParams.get('tab') || RepoPageTabs.RESULTS;
  const [currentTab, setCurrentTab] = React.useState(queryTab);
  const navigate = useNavigate();

  const updateUrlTab = (tab: string) => {
    navigate(`/gh/${orgName}/${repoName}?tab=${tab}`, {
      replace: true,
    });
  };

  // Updates currentTab if query param changes
  React.useEffect(() => {
    setCurrentTab(queryTab);
  }, [queryTab]);

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

  const {data: repository, isLoading: isRepoLoading} = useQuery({
    queryKey: ["getRepoByOrgIdAndName", orgName],
    enabled: (!!repoName) && (!!organization) && (organization.id !== undefined),
    queryFn: async () => {
      const response = await axios.get(`/v1/org/${organization.id}/repo?repo_name=${repoName}`);
      if (!isOk(response)) {
        throw new Error("Network response was not ok");
      }
      return response.data;
    },
  });

  const isLoading = !organization || isRepoLoading;

  return (
    <PageContainer>
      <Card
        style={{
          width: '70%',
          margin: '0 auto',
          padding: '24px',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Typography.Title level={3}>
          <Link to={`/gh/${orgName}`}>{orgName}</Link> / {repoName}
        </Typography.Title>

        {isLoading ? (
          <Spin tip="Loading repository...">
            <div style={{padding: '24px 0'}}>
              <Skeleton active paragraph={{rows: 4}} />
            </div>
          </Spin>
        ) : (
          <Tabs
            defaultActiveKey={currentTab}
            onChange={(key: string) => {
              if (key === RepoPageTabs.CONFIGS || key === RepoPageTabs.RESULTS) {
                setCurrentTab(key);
                updateUrlTab(key);
              }
            }}
            items={[
              {
                key: RepoPageTabs.RESULTS,
                label: 'Results',
                children: <RepoResultsTab repository={repository} organization={organization}/>
              },
              {
                key: RepoPageTabs.CONFIGS,
                label: 'Configs',
                children: <RepoConfigTab repository={repository} organization={organization}/>
              }
            ]}
          />
        )}
      </Card>
    </PageContainer>
  );
};
