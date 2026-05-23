import { useEffect, useState } from "react"
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Tag, message, Popconfirm, Upload, Alert, Row, Col } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, SwapOutlined, UploadOutlined, DownloadOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons"
import { getBookList, addBook, updateBook, deleteBook, borrowBook, importBooks } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import dayjs from "dayjs"

const categories = ["文学小说", "科幻小说", "古典文学", "计算机", "童话", "历史", "哲学", "经济", "其他"]
const labelStyle = { width: 70, textAlign: "right", display: "inline-block" }

export default function BookList() {
  const { user } = useAuth()
  const isAdmin = user?.roles?.includes("admin")
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchForm] = Form.useForm()
  const [searchParams, setSearchParams] = useState({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getBookList({ pageNum, pageSize, ...searchParams })
      setData(res.data.records)
      setTotal(res.data.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [pageNum, pageSize, searchParams])

  const handleSearch = () => {
    const values = searchForm.getFieldsValue()
    const params = {}
    Object.keys(values).forEach(key => {
      if (values[key]) params[key] = values[key]
    })
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

  const handleEdit = (record) => {
    setEditing(record)
    form.setFieldsValue({
      ...record,
      publishDate: record.publishDate ? dayjs(record.publishDate) : null,
    })
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    await deleteBook(id)
    message.success("删除成功")
    fetchData()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (values.publishDate) {
      values.publishDate = values.publishDate.format("YYYY-MM-DD")
    }
    if (editing) {
      await updateBook({ ...values, id: editing.id })
      message.success("更新成功")
    } else {
      await addBook(values)
      message.success("添加成功")
    }
    setModalOpen(false)
    fetchData()
  }

  const handleBorrow = async (bookId) => {
    await borrowBook(bookId)
    message.success("借阅成功")
    fetchData()
  }

  const handleImport = async (file) => {
    setImportLoading(true)
    setImportResult(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await importBooks(formData)
      setImportResult(res.data)
      message.success(`导入完成: 成功${res.data.success}条, 失败${res.data.fail}条`)
      fetchData()
    } catch (e) {
      message.error("导入失败")
    } finally {
      setImportLoading(false)
    }
    return false
  }

  const downloadTemplate = () => {
    const headers = ["书名", "作者", "ISBN", "出版社", "分类", "价格", "库存", "简介"]
    const csvContent = "﻿" + headers.join(",") + "\n示例图书,张三,978-7-0000-0000-0,人民出版社,文学小说,29.90,10,这是一本示例图书"
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "图书导入模板.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "书名", dataIndex: "bookName", width: 150 },
    { title: "作者", dataIndex: "author", width: 100 },
    { title: "ISBN", dataIndex: "isbn", width: 140 },
    { title: "出版社", dataIndex: "publisher", width: 120 },
    { title: "分类", dataIndex: "category", width: 80 },
    { title: "价格", dataIndex: "price", width: 80, render: (v) => "¥" + v },
    { title: "库存", dataIndex: "stock", width: 60 },
    {
      title: "状态", dataIndex: "status", width: 80,
      render: (v) => v === 1 ? <Tag color="green">{"正常"}</Tag> : <Tag color="red">{"下架"}</Tag>,
    },
    {
      title: "借阅", dataIndex: "borrowed", width: 80,
      render: (v) => v ? <Tag color="blue">{"已借"}</Tag> : <Tag color="default">{"未借"}</Tag>,
    },
    {
      title: "操作", width: isAdmin ? 200 : 100, render: (_, record) => (
        <Space>
          <Popconfirm title={"确认借阅此书?"} onConfirm={() => handleBorrow(record.id)}>
            <Button type="link" size="small" icon={<SwapOutlined />} disabled={record.stock <= 0 || record.borrowed}>{"借阅"}</Button>
          </Popconfirm>
          {isAdmin && (
            <>
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>{"编辑"}</Button>
              <Popconfirm title={"确认删除?"} onConfirm={() => handleDelete(record.id)}>
                <Button type="link" size="small" danger icon={<DeleteOutlined />}>{"删除"}</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, padding: 16, background: "#fafafa", borderRadius: 8 }}>
        <Form form={searchForm} layout="horizontal" labelCol={{ style: labelStyle }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="bookName" label={"书名"} style={{ marginBottom: 16 }}>
                <Input placeholder={"请输入"} allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="author" label={"作者"} style={{ marginBottom: 16 }}>
                <Input placeholder={"请输入"} allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isbn" label={"ISBN"} style={{ marginBottom: 16 }}>
                <Input placeholder={"请输入"} allowClear />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="publisher" label={"出版社"} style={{ marginBottom: 16 }}>
                <Input placeholder={"请输入"} allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="category" label={"分类"} style={{ marginBottom: 16 }}>
                <Select placeholder={"请选择"} allowClear>
                  {categories.map(c => <Select.Option key={c} value={c}>{c}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>{"搜索"}</Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>{"重置"}</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
        {isAdmin && (
          <Space>
            <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>{"下载模板"}</Button>
            <Button icon={<UploadOutlined />} onClick={() => { setImportModalOpen(true); setImportResult(null) }}>{"批量导入"}</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>{"新增图书"}</Button>
          </Space>
        )}
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          current: pageNum, pageSize, total,
          onChange: (p, s) => { setPageNum(p); setPageSize(s) },
          showSizeChanger: true, showTotal: (t) => "共 " + t + " 条",
        }}
      />
      <Modal
        title={editing ? "编辑图书" : "新增图书"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="bookName" label={"书名"} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="author" label={"作者"}>
            <Input />
          </Form.Item>
          <Form.Item name="isbn" label={"ISBN"}>
            <Input />
          </Form.Item>
          <Form.Item name="publisher" label={"出版社"}>
            <Input />
          </Form.Item>
          <Form.Item name="publishDate" label={"出版日期"}>
            <Input placeholder={"格式: YYYY-MM-DD"} />
          </Form.Item>
          <Form.Item name="category" label={"分类"}>
            <Select>
              {categories.map(c => <Select.Option key={c} value={c}>{c}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="price" label={"价格"}>
            <InputNumber min={0} precision={2} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="stock" label={"库存"} initialValue={0}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="description" label={"简介"}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="status" label={"状态"} initialValue={1}>
            <Select options={[{ label: "正常", value: 1 }, { label: "下架", value: 0 }]} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={"批量导入图书"}
        open={importModalOpen}
        onCancel={() => setImportModalOpen(false)}
        footer={null}
        width={500}
      >
        <div style={{ marginBottom: 16 }}>
          <Alert
            message={"导入说明"}
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>{"仅支持 .xlsx 格式的 Excel 文件"}</li>
                <li>{"第一行为表头，从第二行开始为数据"}</li>
                <li>{"列顺序: 书名(必填)、作者、ISBN、出版社、分类、价格、库存、简介"}</li>
                <li>{"分类可选: " + categories.join("、")}</li>
              </ul>
            }
            type="info"
            showIcon
          />
        </div>
        <Upload.Dragger
          accept=".xlsx,.xls"
          showUploadList={false}
          beforeUpload={handleImport}
          disabled={importLoading}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">{"点击或拖拽文件到此区域上传"}</p>
          <p className="ant-upload-hint">{"支持 .xlsx 格式的 Excel 文件"}</p>
        </Upload.Dragger>
        {importResult && (
          <div style={{ marginTop: 16 }}>
            <Alert
              message={`导入结果: 成功 ${importResult.success} 条, 失败 ${importResult.fail} 条`}
              type={importResult.fail > 0 ? "warning" : "success"}
              showIcon
            />
            {importResult.errors && importResult.errors.length > 0 && (
              <div style={{ marginTop: 8, maxHeight: 150, overflow: "auto" }}>
                {importResult.errors.map((err, idx) => (
                  <div key={idx} style={{ color: "#ff4d4f", fontSize: 12 }}>{err}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
