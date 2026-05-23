import { useEffect, useRef, useState } from "react"
import { Card, Col, Row, Statistic, Table, Tag } from "antd"
import { BookOutlined, UserOutlined, TeamOutlined, SwapOutlined, ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons"
import { getDashboardStats } from "../services/api"
import { useAuth } from "../context/AuthContext"

const categoryColors = {
  "文学小说": "#1890ff",
  "科幻小说": "#722ed1",
  "古典文学": "#eb2f96",
  "计算机": "#13c2c2",
  "童话": "#52c41a",
  "历史": "#fa8c16",
  "哲学": "#fadb14",
  "经济": "#a0d911",
  "其他": "#8c8c8c",
}

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user?.roles?.includes("admin")
  const [stats, setStats] = useState(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    getDashboardStats().then(res => setStats(res.data)).catch(() => {})
  }, [])

  if (!stats) return null

  const categoryColumns = [
    { title: "分类", dataIndex: "category", key: "category" },
    {
      title: "数量",
      dataIndex: "count",
      key: "count",
      sorter: (a, b) => a.count - b.count,
      render: (v, record) => (
        <Tag color={categoryColors[record.category] || "#8c8c8c"}>{v} 本</Tag>
      ),
    },
  ]

  const borrowSummary = stats.borrowSummary || { borrowing: 0, overdue: 0, returned: 0, total: 0 }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>{"首页概览"}</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={isAdmin ? 6 : 8}>
          <Card hoverable>
            <Statistic title={"图书总数"} value={stats.bookCount} prefix={<BookOutlined />} valueStyle={{ color: "#1890ff" }} />
          </Card>
        </Col>
        {isAdmin && (
          <>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic title={"用户总数"} value={stats.userCount} prefix={<UserOutlined />} valueStyle={{ color: "#52c41a" }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic title={"角色总数"} value={stats.roleCount} prefix={<TeamOutlined />} valueStyle={{ color: "#722ed1" }} />
              </Card>
            </Col>
          </>
        )}
        <Col xs={24} sm={12} lg={isAdmin ? 6 : 8}>
          <Card hoverable>
            <Statistic title={"借阅总数"} value={borrowSummary.total} prefix={<SwapOutlined />} valueStyle={{ color: "#fa8c16" }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title={"各类型图书统计"} bordered={false}>
            <Table
              rowKey="category"
              columns={categoryColumns}
              dataSource={stats.categoryStats}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={"我的借阅概况"} bordered={false}>
            <Row gutter={16}>
              <Col span={8}>
                <Card bordered={false} style={{ textAlign: "center", background: "#e6f7ff" }}>
                  <SwapOutlined style={{ fontSize: 32, color: "#1890ff" }} />
                  <div style={{ fontSize: 28, fontWeight: "bold", color: "#1890ff", marginTop: 8 }}>{borrowSummary.borrowing}</div>
                  <div style={{ color: "#666" }}>{"借阅中"}</div>
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false} style={{ textAlign: "center", background: "#fff1f0" }}>
                  <ClockCircleOutlined style={{ fontSize: 32, color: "#ff4d4f" }} />
                  <div style={{ fontSize: 28, fontWeight: "bold", color: "#ff4d4f", marginTop: 8 }}>{borrowSummary.overdue}</div>
                  <div style={{ color: "#666" }}>{"已超时"}</div>
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false} style={{ textAlign: "center", background: "#f6ffed" }}>
                  <CheckCircleOutlined style={{ fontSize: 32, color: "#52c41a" }} />
                  <div style={{ fontSize: 28, fontWeight: "bold", color: "#52c41a", marginTop: 8 }}>{borrowSummary.returned}</div>
                  <div style={{ color: "#666" }}>{"已归还"}</div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
