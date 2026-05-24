import { useEffect, useState, useMemo } from "react"
import { Table, Button, Tag, message, Popconfirm, Space, Tabs, Input } from "antd"
import { UndoOutlined, ReloadOutlined, UserOutlined, SearchOutlined } from "@ant-design/icons"
import { getBorrowList, returnBook, renewBook } from "../../services/api"

const statusMap = {
  1: { text: "借阅中", color: "processing" },
  2: { text: "已归还", color: "success" },
  3: { text: "已超时", color: "error" },
}

export default function BookBorrow() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [status, setStatus] = useState(1)
  const [expandedRowKeys, setExpandedRowKeys] = useState([])
  const [userSearch, setUserSearch] = useState("")

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getBorrowList({ pageNum, pageSize, status })
      setData(res.data.records)
      setTotal(res.data.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [pageNum, pageSize, status])

  const handleTabChange = (key) => {
    setStatus(Number(key))
    setPageNum(1)
    setExpandedRowKeys([])
  }

  const handleReturn = async (id) => {
    await returnBook(id)
    message.success("归还成功")
    fetchData()
  }

  const handleRenew = async (id) => {
    await renewBook(id)
    message.success("续借成功")
    fetchData()
  }

  // Group data by user
  const groupedData = data.reduce((acc, record) => {
    const key = record.userId
    if (!acc[key]) {
      acc[key] = {
        userId: record.userId,
        nickname: record.nickname,
        username: record.username,
        records: [],
        total: 0,
        borrowing: 0,
        overdue: 0,
      }
    }
    acc[key].records.push(record)
    acc[key].total++
    if (record.status === 1) acc[key].borrowing++
    if (record.status === 3) acc[key].overdue++
    return acc
  }, {})

  const userDataSource = useMemo(() => {
    const all = Object.values(groupedData)
    if (!userSearch.trim()) return all
    const keyword = userSearch.trim().toLowerCase()
    return all.filter(u =>
      (u.nickname && u.nickname.toLowerCase().includes(keyword)) ||
      (u.username && u.username.toLowerCase().includes(keyword))
    )
  }, [groupedData, userSearch])

  const userColumns = [
    {
      title: "用户",
      dataIndex: "nickname",
      render: (v, record) => (
        <Space>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <UserOutlined style={{ color: '#fff', fontSize: 12 }} />
          </div>
          <span style={{ fontWeight: 500 }}>{record.nickname || record.username}</span>
        </Space>
      ),
    },
    {
      title: "借阅总数",
      dataIndex: "total",
      width: 100,
      render: (v) => <Tag>{v} 本</Tag>,
    },
    {
      title: "借阅中",
      dataIndex: "borrowing",
      width: 100,
      render: (v) => <Tag color="processing">{v}</Tag>,
    },
    {
      title: "已超时",
      dataIndex: "overdue",
      width: 100,
      render: (v) => v > 0 ? <Tag color="error">{v}</Tag> : <Tag>0</Tag>,
    },
  ]

  const expandedRowRender = (userRecord) => {
    const columns = [
      { title: "书名", dataIndex: "bookName", width: 180, render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
      { title: "作者", dataIndex: "author", width: 100 },
      { title: "借阅日期", dataIndex: "borrowDate", width: 170 },
      { title: "应还日期", dataIndex: "dueDate", width: 170 },
      { title: "续借次数", dataIndex: "renewCount", width: 90 },
      {
        title: "状态", dataIndex: "status", width: 90,
        render: (v) => {
          const s = statusMap[v] || { text: "未知", color: "default" }
          return <Tag color={s.color}>{s.text}</Tag>
        },
      },
      {
        title: "操作", width: 180, render: (_, record) => (
          <Space size={4}>
            {(record.status === 1 || record.status === 3) && (
              <>
                <Popconfirm title="确认归还?" onConfirm={() => handleReturn(record.id)}>
                  <Button type="link" size="small" icon={<UndoOutlined />}>归还</Button>
                </Popconfirm>
                <Popconfirm title="确认续借?" onConfirm={() => handleRenew(record.id)}>
                  <Button type="link" size="small" icon={<ReloadOutlined />}>续借</Button>
                </Popconfirm>
              </>
            )}
          </Space>
        ),
      },
    ]

    return (
      <Table
        rowKey="id"
        columns={columns}
        dataSource={userRecord.records}
        pagination={false}
        size="small"
      />
    )
  }

  const tabItems = [
    { key: "1", label: "借阅中" },
    { key: "2", label: "已归还" },
    { key: "3", label: "已超时" },
  ]

  return (
    <div>
      <h2 className="page-title">借阅管理</h2>

      <Tabs
        activeKey={String(status)}
        items={tabItems}
        onChange={handleTabChange}
        style={{ marginBottom: 16 }}
      />

      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索用户昵称或用户名"
          allowClear
          prefix={<SearchOutlined />}
          style={{ width: 280 }}
          onChange={(e) => setUserSearch(e.target.value)}
          onSearch={(v) => setUserSearch(v)}
        />
      </div>

      <div className="content-card" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <Table
          rowKey="userId"
          columns={userColumns}
          dataSource={userDataSource}
          loading={loading}
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
          }}
          pagination={{
            current: pageNum, pageSize, total: userDataSource.length,
            onChange: (p, s) => { setPageNum(p); setPageSize(s) },
            showSizeChanger: true, showTotal: (t) => `共 ${t} 人`,
          }}
        />
      </div>
    </div>
  )
}
