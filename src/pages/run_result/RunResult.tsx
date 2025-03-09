import React from "react";
import {Table} from "antd";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {dracula} from 'react-syntax-highlighter/dist/esm/styles/prism';
import Search from "antd/es/input/Search";
import {useQuery} from "react-query";
import {useParams} from "react-router";
import useAxios from "../../context/auth/axios.ts";
import {isOk} from "../../utils/axios.ts";

interface ProjectAnalysisRun {
  id: number;
  run_id: string;
  dir: string;
  type: string;
  drifted: boolean;
  succeeded: boolean;
  init_output: string;
  plan_output: string;
}

interface AnalysisRun {
  uuid: string;
  repository_id: number;
  total_projects: number;
  total_projects_drifted: number;
  duration_millis: number;
  created_at: string;
  updated_at: string;
  projects: ProjectAnalysisRun[];
}

const RunResultPage: React.FC = () => {

  const [items, setItems] = React.useState<ProjectAnalysisRun[]>([]);
  const [run, setRun] = React.useState<AnalysisRun | null>(null);

  const axios = useAxios();
  const {org: orgName, repo: repoName, run: runUuid} = useParams();
  const runQuery = useQuery({
    queryKey: ["getRun", runUuid],
    enabled: !!runUuid,
    queryFn: async () => {
      const response = await axios.get<AnalysisRun>(`/v1/analysis/run/${runUuid}`);
      if (!isOk(response)) {
        throw new Error("Network response was not ok");
      }
      return response.data;
    }
  });

  console.log('temp', run, orgName, repoName);

  React.useEffect(() => {
    if (runQuery.data) {
      setRun(runQuery.data);
      setItems(runQuery.data.projects);
    }
  }, [runQuery.data]);

  const columns = [
    {
      title: 'Project',
      dataIndex: 'dir',
      key: 'dir',
    },
    {
      title: 'Drifted',
      key: 'drifted',
      render: (_: React.ReactNode, record: ProjectAnalysisRun) => (
        <div>{record.drifted ? 'Yes' : 'No'}</div>
      ),
    },
    {
      title: 'Errored',
      key: 'succeeded',
      render: (_: React.ReactNode, record: ProjectAnalysisRun) => (
        <div>{record.succeeded ? 'No' : 'Yes'}</div>
      ),
    },

  ];

  const expandedRowRender = (item: ProjectAnalysisRun) => (
    <div>
      <SyntaxHighlighter language="hcl" style={dracula}>
        {item.plan_output}
      </SyntaxHighlighter>
    </div>
  );

  return (
    <div>
      <Search placeholder="filter projects"
              onSearch={() => {
              }}
              style={{marginBottom: '8px'}}
      />
      <Table dataSource={items} columns={columns}
             loading={runQuery.isLoading}
             rowKey="id"
             pagination={false}
             expandable={{expandedRowRender, expandRowByClick: true, showExpandColumn: true}}/>
    </div>
  );
}

export default RunResultPage;
