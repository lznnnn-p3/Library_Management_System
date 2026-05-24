import { useEffect, useState } from "react"
import { Card, Form, Input, Button, message, Descriptions, Divider, Row, Col } from "antd"
import { UserOutlined, MailOutlined, PhoneOutlined, SaveOutlined, CrownOutlined } from "@ant-design/icons"
import { getProfile, updateProfile } from "../services/api"
import { useAuth } from "../context/AuthContext"

export default function Profile() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(null)
  const [form] = Form.useForm()
  const { user } = useAuth()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await getProfile()
      setProfile(res.data)
      form.setFieldsValue(res.data)
    } catch (e) {
      message.error("获取用户信息失败")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      await updateProfile(values)
      message.success("更新成功")
      fetchProfile()
    } catch (e) {
      // validation error or API error
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="page-title">个人信息</h2>

      <Row gutter={24}>
        {/* Profile Info Card */}
        <Col xs={24} lg={10}>
          <Card
            loading={loading}
            bordered={false}
            className="profile-card"
            style={{ marginBottom: 24 }}
          >
            <div style={{
              textAlign: 'center',
              paddingBottom: 24,
              borderBottom: '1px solid var(--border-light)',
              marginBottom: 24,
            }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              }}>
                <UserOutlined style={{ color: '#fff', fontSize: 32 }} />
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: 4,
              }}>
                {profile?.nickname || profile?.username}
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 12px',
                borderRadius: 12,
                background: user?.roles?.includes('admin') ? 'var(--color-accent-bg)' : 'var(--color-primary-bg)',
                color: user?.roles?.includes('admin') ? 'var(--color-accent)' : 'var(--color-primary)',
                fontSize: 12,
                fontWeight: 600,
              }}>
                {user?.roles?.includes('admin') && <CrownOutlined />}
                {user?.roles?.join(", ") || "-"}
              </div>
            </div>

            <Descriptions column={1} size="small">
              <Descriptions.Item label="用户名">
                <span style={{ fontWeight: 500 }}>{profile?.username}</span>
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                <span style={{ color: 'var(--text-secondary)' }}>{profile?.createTime}</span>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Edit Form Card */}
        <Col xs={24} lg={14}>
          <Card
            bordered={false}
            className="profile-card"
            title="编辑信息"
          >
            <Form form={form} layout="vertical" style={{ maxWidth: 440 }}>
              <Form.Item name="nickname" label="昵称">
                <Input prefix={<UserOutlined />} placeholder="请输入昵称" />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="邮箱"
                    rules={[{ type: "email", message: "请输入有效的邮箱地址" }]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="手机号"
                    rules={[{ pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号" }]}
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={saving}
                  style={{
                    height: 40,
                    paddingInline: 24,
                    fontWeight: 600,
                  }}
                >
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
