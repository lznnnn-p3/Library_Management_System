import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Form, Input, Button, Card, message, Modal } from "antd"
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, BookOutlined } from "@ant-design/icons"
import { useAuth } from "../context/AuthContext"
import { register } from "../services/api"

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [registerForm] = Form.useForm()
  const { login } = useAuth()
  const navigate = useNavigate()

  const onLogin = async (values) => {
    setLoading(true)
    try {
      await login(values.username, values.password)
      message.success("登录成功")
      navigate("/")
    } catch (err) {
      // Error already handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  const onRegister = async () => {
    try {
      const values = await registerForm.validateFields()
      setLoading(true)
      await register({
        username: values.username,
        password: values.password,
        nickname: values.nickname,
        email: values.email,
        phone: values.phone,
      })
      message.success("注册成功，请登录")
      setRegisterOpen(false)
      registerForm.resetFields()
    } catch (err) {
      // Error already handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      {/* Decorative floating elements */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '8%',
        width: 180,
        height: 180,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(217, 119, 6, 0.06) 0%, transparent 70%)',
        animation: 'fadeIn 1s ease both',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '12%',
        width: 240,
        height: 240,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)',
        animation: 'fadeIn 1.2s ease both',
        pointerEvents: 'none',
      }} />

      <div className="login-card animate-fade-in-up" style={{ animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
        <Card
          bordered={false}
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--color-accent), #b45309)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(217, 119, 6, 0.25)',
              }}>
                <BookOutlined style={{ color: '#fff', fontSize: 18 }} />
              </div>
              <span>图书管理系统</span>
            </div>
          }
        >
          <Form onFinish={onLogin} size="large" style={{ marginTop: 4 }}>
            <Form.Item name="username" rules={[{ required: true, message: "请输入用户名" }]}>
              <Input
                prefix={<UserOutlined style={{ color: 'var(--text-tertiary)' }} />}
                placeholder="用户名"
                style={{ height: 44 }}
              />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
              <Input.Password
                prefix={<LockOutlined style={{ color: 'var(--text-tertiary)' }} />}
                placeholder="密码"
                style={{ height: 44 }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: 44,
                  fontSize: 15,
                  fontWeight: 600,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                }}
              >
                登 录
              </Button>
            </Form.Item>
            <div className="login-register-link">
              <Button type="link" onClick={() => setRegisterOpen(true)} style={{ fontSize: 13 }}>
                没有账号？立即注册
              </Button>
            </div>
          </Form>
        </Card>
      </div>

      <Modal
        title="用户注册"
        open={registerOpen}
        onOk={onRegister}
        onCancel={() => { setRegisterOpen(false); registerForm.resetFields() }}
        confirmLoading={loading}
        destroyOnClose
        width={480}
      >
        <Form form={registerForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: "请输入用户名" },
              { min: 3, message: "用户名至少3个字符" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码至少6个字符" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请确认密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error("两次密码不一致"))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请再次输入密码" />
          </Form.Item>
          <Form.Item name="nickname" label="昵称">
            <Input prefix={<UserOutlined />} placeholder="请输入昵称（选填）" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: "email", message: "请输入有效的邮箱地址" }]}
          >
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱（选填）" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号" }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="请输入手机号（选填）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
