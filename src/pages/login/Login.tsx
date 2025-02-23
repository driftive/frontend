import React from "react";
import Button from "antd/es/button";
import {GithubOutlined} from "@ant-design/icons";
import {API_URL} from "../../configs.ts";
import {PageContainer} from "../../components/PageWrapper/PageWrapper.tsx";
import {Flex, Typography} from "antd";

const {Title} = Typography;

export const LoginPage: React.FC = () => {

  const handleLogin = () => {
    window.location.href = `${API_URL}/v1/auth/github`;
  };

  return (
    <PageContainer>
      <Flex vertical justify={"center"} align={"center"}>
        <Title level={2}>Driftive</Title>
        <Button
          type="primary"
          icon={<GithubOutlined/>}
          size="large"
          onClick={handleLogin}
        >
          Login with GitHub
        </Button>
      </Flex>
    </PageContainer>
  );
}
