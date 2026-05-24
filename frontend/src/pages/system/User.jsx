import { useEffect, useState } from "react"
import { Table, Button, Space, Modal, Form, Input, Select, Tag, message, Popconfirm, Row, Col } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons"
import { getUserList, getUserRoles, addUser, updateUser, deleteUser, resetPassword, getRoleList } from "../../services/api"

const labelStyle = { width: 70, textAlign: "right", display: "inline-block" }

export default function User() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchForm] = Form.useForm()
  const [searchParams, setSearchParams] = useState({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [roles, setRoles] = useState([])
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getUserList({ pageNum, pageSize, ...searchParams })
      setData(res.data.records)
      setTotal(res.data.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [pageNum, pageSize, searchParams])

  useEffect(() => {
    getRoleList().then(res => setRoles(res.data))
  }, [])

  const handleSearch = () => {
    const values = searchForm.getFieldsValue()
    const params = {}
    if (values.username) params.username = values.username
    if (values.nickname) params.nickname = values.nickname
    if (values.email) params.email = values.email
    if (values.phone) params.phone = values.phone
    if (values.status !== undefined && values.status !== null) params.status = values.status
    setPageNum(1)
    setSearchParams(params)
  }

  const handleReset = () => {
    searchForm.resetFields()
    setPageNum(1)
    setSearchParams({})
  }

  const handleAdd = () => {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = async (record) => {
    setEditing(record)
    setModalOpen(true)
    try {
      const res = await getUserRoles(record.id)
      form.setFieldsValue({ ...record, roleIds: res.data || [] })
    } catch (e) {
      form.setFieldsValue({ ...record, roleIds: [] })
    }
  }

  const handleDelete = async (id) => {
    await deleteUser(id)
    message.success("删除成功")
    fetchData()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) {
      await updateUser({ ...values, id: editing.id, username: editing.username })
      message.success("更新成功")
    } else {
      await addUser(values)
      message.success("添加成功")
    }
    setModalOpen(false)
    fetchData()
  }

  const handleResetPwd = async (id) => {
    await resetPassword(id, "123456")
    message.success("密码已重置为 123456")
  }

  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "用户名", dataIndex: "username", render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
    { title: "昵称", dataIndex: "nickname" },
    { title: "邮箱", dataIndex: "email", render: (v) => <span style={{ color: 'var(--text-secondary)' }}>{v || '-'}</span> },
    { title: "手机号", dataIndex: "phone", render: (v) => <span style={{ color: 'var(--text-secondary)' }}>{v || '-'}</span> },
    {
      title: "状态", dataIndex: "status", width: 80,
      render: (v) => v === 1 ? <Tag color="success">正常</Tag> : <Tag color="error">禁用</Tag>,
    },
    { title: "创建时间", dataIndex: "createTime", width: 180 },
    {
      title: "操作", width: 200, render: (_, record) => (
        <Space size={4}>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确认重置密码为 123456?" onConfirm={() => handleResetPwd(record.id)}>
            <Button type="link" size="small" icon={<KeyOutlined />}>重置密码</Button>
          </Popconfirm>
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 className="page-title">用户管理</h2>

      {/* Search Panel */}
      <div className="search-panel">
        <Form form={searchForm} layout="horizontal" labelCol={{ style: labelStyle }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="username" label="用户名" style={{ marginBottom: 16 }}>
                <Input placeholder="请输入" allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="nickname" label="昵称" style={{ marginBottom: 16 }}>
                <Input placeholder="请输入" allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="email" label="邮箱" style={{ marginBottom: 16 }}>
                <Input placeholder="请输入" allowClear />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="phone" label="手机号" style={{ marginBottom: 16 }}>
                <Input placeholder="请输入" allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="状态" style={{ marginBottom: 16 }}>
                <Select placeholder="请选择" allowClear>
                  <Select.Option value={1}>正常</Select.Option>
                  <Select.Option value={0}>禁用</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增用户</Button>
      </div>

      {/* Table */}
      <div className="content-card" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: pageNum, pageSize, total,
            onChange: (p, s) => { setPageNum(p); setPageSize(s) },
            showSizeChanger: true, showTotal: (t) => `共 ${t} 条`,
          }}
        />
      </div>

      {/* Modal */}
      <Modal
        title={editing ? "编辑用户" : "新增用户"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          {!editing && (
            <>
              <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="password" label="密码" rules={[{ required: true }]}>
                <Input.Password />
              </Form.Item>
            </>
          )}
          <Form.Item name="nickname" label="昵称">
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="邮箱">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="手机号">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select options={[{ label: "正常", value: 1 }, { label: "禁用", value: 0 }]} />
          </Form.Item>
          <Form.Item name="roleIds" label="角色">
            <Select mode="multiple" placeholder="请选择角色">
              {roles.map(r => <Select.Option key={r.id} value={r.id}>{r.roleName}</Select.Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
