import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'

const theme = {
  token: {
    colorPrimary: '#2563eb',
    colorSuccess: '#059669',
    colorError: '#dc2626',
    colorWarning: '#d97706',
    colorInfo: '#2563eb',
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    borderRadius: 6,
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f8f6f3',
    colorBorder: '#e8e5e0',
    colorBorderSecondary: '#ebebeb',
    colorText: '#1a1a2e',
    colorTextSecondary: '#64748b',
    controlHeight: 36,
    fontSize: 14,
  },
  components: {
    Layout: {
      siderBg: '#1a1f36',
      headerBg: 'rgba(255, 255, 255, 0.85)',
      bodyBg: '#f8f6f3',
      headerHeight: 56,
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.06)',
      darkItemSelectedBg: 'rgba(255, 255, 255, 0.1)',
      darkItemSelectedColor: '#ffffff',
      darkItemColor: 'rgba(255, 255, 255, 0.75)',
      darkSubMenuItemBg: 'transparent',
      itemHeight: 42,
      itemMarginInline: 8,
      itemBorderRadius: 8,
    },
    Table: {
      headerBg: '#faf9f7',
      headerColor: '#64748b',
      headerSortActiveBg: '#f0ede8',
      rowHoverBg: '#faf9f7',
      borderColor: '#e8e5e0',
      cellPaddingBlock: 12,
    },
    Card: {
      paddingLG: 20,
    },
    Button: {
      fontWeight: 500,
      controlHeight: 36,
    },
    Input: {
      controlHeight: 36,
    },
    Select: {
      controlHeight: 36,
    },
    Tag: {
      borderRadiusSM: 4,
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ConfigProvider locale={zhCN} theme={theme}>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </ConfigProvider>
)
