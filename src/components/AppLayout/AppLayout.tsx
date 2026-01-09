import React from 'react';
import {Layout} from 'antd';
import {AppHeader} from '../AppHeader/AppHeader';
import {Outlet} from 'react-router';

const {Content} = Layout;

export const AppLayout: React.FC = () => {
  return (
    <Layout style={{minHeight: '100vh'}}>
      <AppHeader />
      <Content
        style={{
          background: '#f5f7fa',
          padding: '32px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            width: '100%',
          }}
        >
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};
