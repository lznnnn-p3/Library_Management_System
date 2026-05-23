import { useEffect, useState } from "react"
import { Table, Button, Tag, message, Popconfirm, Space, Tabs } from "antd"
import { UndoOutlined, ReloadOutlined } from "@ant-design/icons"
import { getBorrowList, returnBook, renewBook } from "../../services/api"
import { useAuth } from "../../context/AuthContext"

const statusMap = {
  1: { text: "借阅中", color: "blue" },
  2: { text: "已归还", color: "green" },
  3: { text: "已超时", color: "red" },
}

export default function BookRecord() {
  const { user } = useAuth()
  const isAdmin = user?.roles?.includes("admin")
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [status, setStatus] = useState(undefined)

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
    setStatus(key === "all" ? undefined : Number(key))
    setPageNum(1)
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

  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "书名", dataIndex: "bookName", width: 180 },
    { title: "作者", dataIndex: "author", width: 100 },
    { title: "借阅人", dataIndex: "nickname", width: 100 },
    { title: "借阅日期", dataIndex: "borrowDate", width: 170 },
    { title: "应还日期", dataIndex: "dueDate", width: 170 },
    { title: "归还日期", dataIndex: "returnDate", width: 170, render: (v) => v || "-" },
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
        <Space>
          {(record.status === 1 || record.status === 3) && (
            <>
              <Popconfirm title={"确认归还?"} onConfirm={() => handleReturn(record.id)}>
                <Button type="link" size="small" icon={<UndoOutlined />}>{"归还"}</Button>
              </Popconfirm>
              <Popconfirm title={"确认续借?"} onConfirm={() => handleRenew(record.id)}>
                <Button type="link" size="small" icon={<ReloadOutlined />}>{"续借"}</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ]

  const tabItems = [
    { key: "all", label: "全部记录" },
    { key: "1", label: "借阅中" },
    { key: "2", label: "已归还" },
    { key: "3", label: "已超时" },
  ]

  return (
    <div>
      <Tabs activeKey={status === undefined ? "all" : String(status)} items={tabItems} onChange={handleTabChange} style={{ marginBottom: 16 }} />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          current: pageNum, pageSize, total,
          onChange: (p, s) => { setPageNum(p); setPageSize(s) },
          showSizeChanger: true, showTotal: (t) => "共 " + t + " 条",
        }}
      />
    </div>
  )
}
