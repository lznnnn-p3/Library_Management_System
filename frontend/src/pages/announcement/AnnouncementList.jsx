import { useEffect, useRef, useState } from "react"
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Switch, Table, Tag, message } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import { getAnnouncementList, addAnnouncement, updateAnnouncement, deleteAnnouncement } from "../../services/api"

export default function AnnouncementList() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchForm] = Form.useForm()
  const [searchParams, setSearchParams] = useState({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()
  const fetchedRef = useRef(false)

  const fetchData = (params = {}) => {
    setLoading(true)
    getAnnouncementList({ pageNum, pageSize, ...searchParams, ...params })
      .then(res => {
        setData(res.data.records)
        setTotal(res.data.total)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchData()
  }, [])

  useEffect(() => {
    fetchData()
  }, [pageNum, pageSize])

  const handleSearch = () => {
    const values = searchForm.getFieldsValue()
    setPageNum(1)
    setSearchParams(values)
    fetchData({ pageNum: 1, ...values })
  }

  const handleReset = () => {
    searchForm.resetFields()
    setPageNum(1)
    setSearchParams({})
    fetchData({ pageNum: 1 })
  }

  const handleAdd = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ isTop: 0, status: 1 })
    setModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditing(record)
    form.setFieldsValue({
      title: record.title,
      content: record.content,
      isTop: record.isTop,
      status: record.status,
    })
    setModalOpen(true)
  }

  const handleDelete = (id) => {
    deleteAnnouncement(id).then(() => {
      message.success("删除成功")
      fetchData()
    })
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      await updateAnnouncement({ id: editing.id, ...values })
      message.success("更新成功")
    } else {
      await addAnnouncement(values)
      message.success("添加成功")
    }
    setModalOpen(false)
    fetchData()
  }

  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "标题", dataIndex: "title", ellipsis: true },
    {
      title: "置顶",
      dataIndex: "isTop",
      width: 90,
      render: (v) => v === 1 ? <Tag color="orange">置顶</Tag> : <Tag>普通</Tag>,
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (v) => v === 1 ? <Tag color="green">已发布</Tag> : <Tag color="default">已下架</Tag>,
    },
    { title: "创建时间", dataIndex: "createTime", width: 170 },
    {
      title: "操作",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 className="page-title">公告管理</h2>

      <Card bordered={false} className="content-card" style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline">
          <Form.Item name="title"><Input placeholder="标题" allowClear /></Form.Item>
          <Form.Item name="status">
            <Select placeholder="状态" allowClear style={{ width: 120 }}>
              <Select.Option value={1}>已发布</Select.Option>
              <Select.Option value={0}>已下架</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleSearch}>搜索</Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card bordered={false} className="content-card">
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增公告</Button>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: pageNum,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, s) => { setPageNum(p); setPageSize(s) },
          }}
        />
      </Card>

      <Modal
        title={editing ? "编辑公告" : "新增公告"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: "请输入标题" }]}>
            <Input placeholder="请输入公告标题" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: "请输入内容" }]}>
            <Input.TextArea rows={6} placeholder="请输入公告内容" />
          </Form.Item>
          <Form.Item name="isTop" label="置顶" valuePropName="checked" getValueFromEvent={(checked) => checked ? 1 : 0} getValueProps={(value) => ({ checked: value === 1 })}>
            <Switch checkedChildren="置顶" unCheckedChildren="普通" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Select.Option value={1}>已发布</Select.Option>
              <Select.Option value={0}>已下架</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
