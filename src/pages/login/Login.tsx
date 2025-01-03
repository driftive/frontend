import React from "react";
import Layout, {Content} from "antd/es/layout/layout";
import Title from "antd/es/skeleton/Title";
import Button from "antd/es/button";
import {GithubOutlined} from "@ant-design/icons";
import {API_URL} from "../../configs.ts";

export const LoginPage: React.FC = () => {

  const handleLogin = () => {
    window.location.href = `${API_URL}/v1/auth/github`;
  };

  return (
    <Layout style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <Content style={{textAlign: 'center'}}>
        <Title level={2}>Welcome to Our App</Title>
        <Button
          type="primary"
          icon={<GithubOutlined/>}
          size="large"
          onClick={handleLogin}
        >
          Login with GitHub
        </Button>
      </Content>
    </Layout>
  );
}
