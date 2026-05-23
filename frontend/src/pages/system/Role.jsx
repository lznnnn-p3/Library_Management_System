import { useEffect, useState } from "react"
import { Table, Button, Space, Modal, Form, Input, Select, Tag, message, Popconfirm, Tree, Tabs } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import { getRoleList, getRoleMenus, addRole, updateRole, deleteRole, getAllMenus } from "../../services/api"

export default function Role() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [menuTree, setMenuTree] = useState([])
  const [checkedKeys, setCheckedKeys] = useState([])
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getRoleList()
      setData(res.data)
    } finally {
      setLoading(false)
    }
  }

  const fetchMenuTree = async () => {
    const res = await getAllMenus()
    setMenuTree(res.data)
  }

  useEffect(() => { fetchData() }, [])
  useEffect(() => { fetchMenuTree() }, [])

  const buildTreeData = (menus) =>
    menus.map(m => ({
      key: m.id,
      title: m.menuName,
      children: m.children ? buildTreeData(m.children) : [],
    }))

  const handleAdd = () => {
    setEditing(null)
    form.resetFields()
    setCheckedKeys([])
    setModalOpen(true)
  }

  const handleEdit = async (record) => {
    setEditing(record)
    form.setFieldsValue(record)
    setModalOpen(true)
    try {
      const res = await getRoleMenus(record.id)
      setCheckedKeys(res.data || [])
    } catch (e) {
      setCheckedKeys([])
    }
  }

  const handleDelete = async (id) => {
    await deleteRole(id)
    message.success("删除成功")
    fetchData()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const menuIds = checkedKeys
    if (editing) {
      await updateRole({ ...values, id: editing.id, menuIds })
      message.success("更新成功")
    } else {
      await addRole({ ...values, menuIds })
      message.success("添加成功")
    }
    setModalOpen(false)
    fetchData()
  }

  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "角色名称", dataIndex: "roleName" },
    { title: "角色标识", dataIndex: "roleKey" },
    {
      title: "状态", dataIndex: "status", width: 80,
      render: (v) => v === 1 ? <Tag color="green">{"正常"}</Tag> : <Tag color="red">{"禁用"}</Tag>,
    },
    { title: "创建时间", dataIndex: "createTime", width: 180 },
    {
      title: "操作", width: 150, render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>{"编辑"}</Button>
          <Popconfirm title={"确认删除?"} onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>{"删除"}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const tabItems = [
    {
      key: "info",
      label: "基本信息",
      children: (
        <>
          <Form.Item name="roleName" label={"角色名称"} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="roleKey" label={"角色标识"} rules={[{ required: true }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item name="status" label={"状态"} initialValue={1}>
            <Select options={[{ label: "正常", value: 1 }, { label: "禁用", value: 0 }]} />
          </Form.Item>
        </>
      ),
    },
    {
      key: "menu",
      label: "菜单权限",
      children: (
        <Tree
          checkable
          checkedKeys={checkedKeys}
          onCheck={setCheckedKeys}
          treeData={buildTreeData(menuTree)}
          defaultExpandAll
          style={{ maxHeight: 400, overflow: "auto" }}
        />
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>{"新增角色"}</Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={false} />
      <Modal
        title={editing ? "编辑角色" : "新增角色"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
        width={500}
      >
        <Form form={form} layout="vertical">
          <Tabs items={tabItems} defaultActiveKey="info" />
        </Form>
      </Modal>
    </div>
  )
}
