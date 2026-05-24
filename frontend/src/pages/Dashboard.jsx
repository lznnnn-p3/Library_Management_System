import { useEffect, useRef, useState } from "react"
import { Card, Col, Row, Statistic, Table, Tag } from "antd"
import { BookOutlined, UserOutlined, TeamOutlined, SwapOutlined, ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons"
import { getDashboardStats } from "../services/api"
import { useAuth } from "../context/AuthContext"

const categoryColors = {
  "文学小说": "#2563eb",
  "科幻小说": "#7c3aed",
  "古典文学": "#db2777",
  "计算机": "#0891b2",
  "童话": "#059669",
  "历史": "#d97706",
  "哲学": "#ca8a04",
  "经济": "#65a30d",
  "其他": "#78716c",
}

const statConfig = [
  { key: "bookCount", title: "图书总数", icon: <BookOutlined />, color: "#2563eb", bg: "linear-gradient(135deg, #eff6ff, #dbeafe)" },
  { key: "userCount", title: "用户总数", icon: <UserOutlined />, color: "#059669", bg: "linear-gradient(135deg, #ecfdf5, #d1fae5)", adminOnly: true },
  { key: "roleCount", title: "角色总数", icon: <TeamOutlined />, color: "#7c3aed", bg: "linear-gradient(135deg, #f5f3ff, #ede9fe)", adminOnly: true },
  { key: "borrowTotal", title: "借阅总数", icon: <SwapOutlined />, color: "#d97706", bg: "linear-gradient(135deg, #fffbeb, #fef3c7)" },
]

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

  const borrowSummary = stats.borrowSummary || { borrowing: 0, overdue: 0, returned: 0, total: 0 }

  const getStatValue = (key) => {
    if (key === "borrowTotal") return borrowSummary.total
    return stats[key]
  }

  const filteredStats = statConfig.filter(s => !s.adminOnly || isAdmin)

  const categoryColumns = [
    { title: "分类", dataIndex: "category", key: "category" },
    {
      title: "数量",
      dataIndex: "count",
      key: "count",
      sorter: (a, b) => a.count - b.count,
      render: (v, record) => (
        <Tag
          style={{
            background: (categoryColors[record.category] || "#78716c") + "14",
            color: categoryColors[record.category] || "#78716c",
            border: 'none',
            fontWeight: 600,
            borderRadius: 4,
            padding: '2px 10px',
          }}
        >
          {v} 本
        </Tag>
      ),
    },
  ]

  return (
    <div>
      <h2 className="page-title">首页概览</h2>

      {/* Stat Cards */}
      <Row gutter={[16, 16]}>
        {filteredStats.map((s, i) => (
          <Col xs={24} sm={12} lg={filteredStats.length <= 2 ? 12 : 6} key={s.key}>
            <div className={`stat-card animate-fade-in-up delay-${i + 1}`}>
              <Card
                hoverable
                bordered={false}
                style={{ background: s.bg }}
                styles={{ body: { padding: '20px 24px' } }}
              >
                <Statistic
                  title={s.title}
                  value={getStatValue(s.key)}
                  prefix={<span style={{ color: s.color }}>{s.icon}</span>}
                  valueStyle={{ color: s.color, fontFamily: 'var(--font-display)' }}
                />
              </Card>
            </div>
          </Col>
        ))}
      </Row>

      {/* Category Stats & Borrow Summary */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={12}>
          <Card
            title="各类型图书统计"
            bordered={false}
            className="content-card"
          >
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
          <Card
            title="我的借阅概况"
            bordered={false}
            className="content-card"
          >
            <Row gutter={[12, 12]}>
              <Col span={8}>
                <div className="borrow-summary-card borrowing">
                  <SwapOutlined className="borrow-icon" style={{ color: 'var(--color-primary)' }} />
                  <div className="borrow-count" style={{ color: 'var(--color-primary)' }}>{borrowSummary.borrowing}</div>
                  <div className="borrow-label">借阅中</div>
                </div>
              </Col>
              <Col span={8}>
                <div className="borrow-summary-card overdue">
                  <ClockCircleOutlined className="borrow-icon" style={{ color: 'var(--color-error)' }} />
                  <div className="borrow-count" style={{ color: 'var(--color-error)' }}>{borrowSummary.overdue}</div>
                  <div className="borrow-label">已超时</div>
                </div>
              </Col>
              <Col span={8}>
                <div className="borrow-summary-card returned">
                  <CheckCircleOutlined className="borrow-icon" style={{ color: 'var(--color-success)' }} />
                  <div className="borrow-count" style={{ color: 'var(--color-success)' }}>{borrowSummary.returned}</div>
                  <div className="borrow-label">已归还</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
