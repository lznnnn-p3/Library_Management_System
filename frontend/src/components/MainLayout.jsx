import { useState } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { Layout, Menu, Button, Avatar, Dropdown, Space } from "antd"
import {
  DashboardOutlined,
  SettingOutlined,
  BookOutlined,
  UserOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  SwapOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons"
import { useAuth } from "../context/AuthContext"

const { Header, Sider, Content } = Layout

const iconMap = {
  DashboardOutlined: <DashboardOutlined />,
  SettingOutlined: <SettingOutlined />,
  BookOutlined: <BookOutlined />,
  UserOutlined: <UserOutlined />,
  TeamOutlined: <TeamOutlined />,
  UnorderedListOutlined: <UnorderedListOutlined />,
  SwapOutlined: <SwapOutlined />,
  FileTextOutlined: <FileTextOutlined />,
}

function buildMenuItems(menus) {
  return menus.map((menu) => {
    const item = {
      key: menu.path,
      icon: iconMap[menu.icon],
      label: menu.menuName,
    }
    if (menu.children && menu.children.length > 0) {
      item.children = buildMenuItems(menu.children)
    }
    return item
  })
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, menus, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = buildMenuItems(menus)

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const dropdownItems = {
    items: [
      { key: "profile", icon: <UserOutlined style={{ fontSize: 14 }} />, label: "个人信息", onClick: () => navigate("/profile") },
      { type: "divider" },
      { key: "logout", icon: <LogoutOutlined style={{ fontSize: 14 }} />, label: "退出登录", onClick: handleLogout, danger: true },
    ],
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={232}
        style={{
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          overflow: 'auto',
        }}
      >
        {/* Logo */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          gap: 12,
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: 'linear-gradient(135deg, var(--color-accent), #b45309)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)',
          }}>
            <BookOutlined style={{ color: '#fff', fontSize: 18 }} />
          </div>
          {!collapsed && (
            <span style={{
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}>
              图书管理系统
            </span>
          )}
        </div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            borderRight: 'none',
            padding: '8px 0',
          }}
        />
      </Sider>

      {/* Main Content Area */}
      <Layout style={{ marginLeft: collapsed ? 80 : 232, transition: 'margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        {/* Header */}
        <Header style={{
          background: 'var(--bg-header)',
          backdropFilter: 'blur(12px)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-light)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: 56,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: 16,
              width: 40,
              height: 40,
              borderRadius: 8,
              color: 'var(--text-secondary)',
            }}
          />
          <Dropdown menu={dropdownItems} placement="bottomRight" trigger={['click']}>
            <Space style={{
              cursor: 'pointer',
              padding: '4px 12px 4px 4px',
              borderRadius: 24,
              transition: 'background 0.15s ease',
            }}
            className="user-dropdown-trigger"
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-search)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Avatar
                size={32}
                icon={<UserOutlined />}
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary), #1d4ed8)',
                  fontSize: 14,
                }}
              />
              <span style={{
                fontWeight: 500,
                fontSize: 14,
                color: 'var(--text-primary)',
              }}>
                {user?.nickname || user?.username}
              </span>
            </Space>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content style={{
          margin: 24,
          minHeight: 280,
          animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
