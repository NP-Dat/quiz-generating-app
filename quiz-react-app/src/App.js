import React, { useState } from 'react';
import { Layout, Typography, Switch, ConfigProvider, theme, Space } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons'; // Icons for theme switch
import Quiz from './Quiz';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = (checked) => {
    setIsDarkMode(checked);
  };

  const lightTheme = {
    token: {
      colorPrimary: '#61dafb', // A familiar light blue
      colorBgContainer: '#ffffff', // White containers
      colorBgLayout: '#f0f2f5', // Light gray layout background
    },
    algorithm: theme.defaultAlgorithm,
  };

  const darkTheme = {
    token: {
      colorPrimary: '#61dafb', // Keep the blue accent
      colorBgContainer: '#2b2b2b', // Dark container background
      colorBgLayout: '#1f1f1f', // Darker layout background
      colorText: 'rgba(255, 255, 255, 0.85)', // Light text
      colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
      // ... you can customize more tokens for dark theme
    },
    algorithm: theme.darkAlgorithm,
  };

  return (
    <ConfigProvider theme={isDarkMode ? darkTheme : lightTheme}>
       {/* Apply theme to the Ant Design components */}
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
          <Title level={2} style={{ color: 'white', margin: 0 }}>Networking Quiz</Title>
          <Space>
             <Switch
                checkedChildren={<BulbFilled />}
                unCheckedChildren={<BulbOutlined />}
                onChange={toggleTheme}
                checked={isDarkMode}
             />
             <span style={{ color: 'white'}}>{isDarkMode ? 'Dark' : 'Light'} Mode</span>
          </Space>
        </Header>
        <Content style={{ padding: '20px 50px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          {/* The Quiz component will now be centered within the Content area */}
          <Quiz />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Test your knowledge! ©{(new Date()).getFullYear()}
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
