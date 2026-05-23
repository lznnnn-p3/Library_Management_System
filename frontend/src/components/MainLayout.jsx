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
  ProfileOutlined,
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
      { key: "profile", icon: <UserOutlined />, label: "个人信息", onClick: () => navigate("/profile") },
      { key: "logout", icon: <LogoutOutlined />, label: "退出登录", onClick: handleLogout },
    ],
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BookOutlined style={{ color: "#fff", fontSize: 24 }} />
          {!collapsed && <span style={{ color: "#fff", fontSize: 18, marginLeft: 12 }}>{"图书管理系统"}</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Dropdown menu={dropdownItems} placement="bottomRight">
            <Space style={{ cursor: "pointer" }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.nickname || user?.username}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: "#fff", borderRadius: 8, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
