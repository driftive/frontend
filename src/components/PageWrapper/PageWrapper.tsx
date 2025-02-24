import React from "react";
import {Layout} from "antd";

const {Content} = Layout;

export interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = (props) => {
  return (
    <Layout style={{minHeight: "100vh", backgroundColor: "#f0f2f5"}}>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingTop: 128,
        }}
      >
        {props.children}
      </Content>
    </Layout>
  );
};
