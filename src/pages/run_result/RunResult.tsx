import React from "react";
import {Table} from "antd";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {dracula} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {ProjectResult} from "../../model/ProjectResult.ts";
import Search from "antd/es/input/Search";

const RunResultPage: React.FC = () => {

  const dataSource: (ProjectResult & { key: string })[] = [
    {
      key: '1', project: 'gcp/project1',
      adds: 1, changes: 0, destroys: 1, output: `
Terraform will perform the following actions:

  # null_resource.foo must be replaced
-/+ resource "null_resource" "foo" {
      ~ id       = "4654577444608769802" -> (known after apply)
      ~ triggers = { # forces replacement
          ~ "foo" = "bar" -> "bar2"
        }
    }

Plan: 1 to add, 0 to change, 1 to destroy.
    `
    },
    {
      key: '2', project: 'gcp/project2', adds: 1, changes: 0, destroys: 1, output: `
Terraform will perform the following actions:
  
    # null_resource.foo must be replaced
`
    }
  ];

  const columns = [
    {
      title: 'Project',
      dataIndex: 'project',
      key: 'project',
    },
    {
      title: 'Changes',
      key: 'changes',
      render: (_: React.ReactNode, record: ProjectResult) => (
        <div>{record.adds} to add, {record.changes} to change, {record.destroys} to destroy</div>
      ),
    },
  ];

  const expandedRowRender = (item: ProjectResult) => (
    // simulate terminal output. Add linebreaks and color
    <div>
      <SyntaxHighlighter language="hcl" style={dracula}>
        {item.output}
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
      <Table dataSource={dataSource} columns={columns}
             expandable={{expandedRowRender, expandRowByClick: true, showExpandColumn: true}}/>
    </div>
  );
}

export default RunResultPage;
