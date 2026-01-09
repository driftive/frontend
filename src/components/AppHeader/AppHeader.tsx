import React, {useContext} from 'react';
import {Avatar, Button, Dropdown, Layout, Space, Typography} from 'antd';
import {GithubOutlined, LogoutOutlined, UserOutlined} from '@ant-design/icons';
import {Link, useNavigate} from 'react-router';
import {AuthDispatchContext, AuthStateContext} from '../../context/auth/context';

const {Header} = Layout;

export const AppHeader: React.FC = () => {
  const authState = useContext(AuthStateContext);
  const dispatch = useContext(AuthDispatchContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch?.({type: 'LOGOUT'});
    localStorage.removeItem('authState');
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      }}
    >
      <Link to="/gh/orgs" style={{textDecoration: 'none'}}>
        <Space align="center" size={12}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography.Text
              strong
              style={{color: '#fff', fontSize: 18, fontFamily: 'monospace'}}
            >
              D
            </Typography.Text>
          </div>
          <Typography.Title
            level={4}
            style={{margin: 0, color: '#1a1a1a', fontWeight: 600}}
          >
            Driftive
          </Typography.Title>
        </Space>
      </Link>

      <Space size={16}>
        <Button
          type="text"
          icon={<GithubOutlined />}
          href="https://github.com/driftive/driftive"
          target="_blank"
          aria-label="View Driftive on GitHub"
        />
        {authState?.isAuthenticated && (
          <Dropdown menu={{items: userMenuItems}} placement="bottomRight">
            <Avatar
              style={{
                backgroundColor: '#1890ff',
                cursor: 'pointer',
              }}
              icon={<UserOutlined />}
            />
          </Dropdown>
        )}
      </Space>
    </Header>
  );
};
